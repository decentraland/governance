import { PublishBatchCommand, SNSClient } from '@aws-sdk/client-sns'
import { Events } from '@dcl/schemas'

import { PublishableEvent, createSnsPublisher } from './sns'

jest.mock('decentraland-gatsby/dist/utils/env', () => {
  return (key: string, fallback?: string) => {
    if (key === 'AWS_SNS_ARN') return 'arn:aws:sns:region:account:topic'
    if (key === 'AWS_SNS_ENDPOINT') return ''
    return fallback ?? ''
  }
})

jest.mock('@aws-sdk/client-sns', () => {
  const actual = jest.requireActual('@aws-sdk/client-sns')
  return {
    ...actual,
    SNSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PublishBatchCommand: jest.fn().mockImplementation((args) => ({ args })),
  }
})

describe('when publishing messages with SNS', () => {
  let clientSend: jest.Mock

  function createEvents(count: number): PublishableEvent[] {
    return Array.from({ length: count }).map((_, i) => ({
      type: Events.Type.GOVERNANCE,
      subType: Events.SubType.Governance.PROPOSAL_ENACTED,
      key: `k-${i}`,
      timestamp: 1234567890,
      metadata: {
        proposalId: `proposal-${i}`,
        proposalTitle: `Proposal ${i}`,
        title: `Title ${i}`,
        description: `Description ${i}`,
        link: `https://example.com/proposal-${i}`,
        address: `0x${i.toString().padStart(40, '0')}`,
      },
    }))
  }

  beforeEach(() => {
    clientSend = jest.fn()
    ;(SNSClient as unknown as jest.Mock).mockImplementation(() => ({
      send: clientSend,
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('and there are more than 10 events', () => {
    let events: PublishableEvent[]

    beforeEach(() => {
      events = createEvents(25)
      clientSend
        .mockResolvedValueOnce({
          Successful: events.slice(0, 10).map((_, i) => ({ MessageId: `m-${i}` })),
        })
        .mockResolvedValueOnce({
          Successful: events.slice(10, 20).map((_, i) => ({ MessageId: `m-${10 + i}` })),
        })
        .mockResolvedValueOnce({
          Successful: events.slice(20, 25).map((_, i) => ({ MessageId: `m-${20 + i}` })),
        })
    })

    it('should batch into chunks of 10 and return all message ids', async () => {
      const { publishMessages } = createSnsPublisher()
      const res = await publishMessages(events)
      expect(res.successfulMessageIds).toHaveLength(25)
    })
  })

  describe('and some events fail temporarily', () => {
    let events: PublishableEvent[]

    beforeEach(() => {
      events = createEvents(5)
      clientSend.mockResolvedValueOnce({
        Successful: [{ MessageId: 'a' }, { MessageId: 'b' }, { MessageId: 'c' }],
        Failed: [{ Id: 'msg_0_3' }, { Id: 'msg_0_4' }],
      })
      clientSend.mockResolvedValueOnce({
        Successful: [{ MessageId: 'd' }, { MessageId: 'e' }],
      })
    })

    it('should retry failures and end with no failed events', async () => {
      const { publishMessages } = createSnsPublisher()
      const res = await publishMessages(events)
      expect(res.failedEvents).toHaveLength(0)
    })
  })

  describe('and events keep failing after max retries', () => {
    let events: PublishableEvent[]

    beforeEach(() => {
      events = createEvents(3)
      clientSend.mockResolvedValueOnce({
        Failed: [{ Id: 'msg_0_0' }, { Id: 'msg_0_1' }, { Id: 'msg_0_2' }],
      })
      clientSend.mockResolvedValueOnce({
        Failed: [{ Id: 'msg_1_0' }, { Id: 'msg_1_1' }],
      })
      clientSend.mockResolvedValueOnce({ Failed: [{ Id: 'msg_2_0' }] })
      clientSend.mockResolvedValueOnce({ Failed: [{ Id: 'msg_3_0' }] })
    })

    it('should return remaining failed events', async () => {
      const { publishMessages } = createSnsPublisher()
      const res = await publishMessages(events)
      expect(res.failedEvents).toHaveLength(1)
    })
  })

  describe('and attributes are attached to messages', () => {
    let events: PublishableEvent[]
    let capturedCommandArgs: {
      PublishBatchRequestEntries: Array<{
        MessageAttributes: {
          type: { StringValue: string }
          subType: { StringValue: string }
        }
      }>
    }

    beforeEach(() => {
      events = createEvents(1)
      ;(PublishBatchCommand as unknown as jest.Mock).mockImplementation((args) => {
        capturedCommandArgs = args
        return { args }
      })
      clientSend.mockResolvedValue({ Successful: [{ MessageId: 'ok' }] })
    })

    it('should set type and subType as SNS attributes', async () => {
      const { publishMessages } = createSnsPublisher()
      const res = await publishMessages(events)
      expect(res.failedEvents).toHaveLength(0)
      expect(capturedCommandArgs.PublishBatchRequestEntries[0].MessageAttributes.type.StringValue).toBe(
        Events.Type.GOVERNANCE
      )
      expect(capturedCommandArgs.PublishBatchRequestEntries[0].MessageAttributes.subType.StringValue).toBe(
        Events.SubType.Governance.PROPOSAL_ENACTED
      )
    })
  })
})
