import type { APIEmbed } from 'discord.js'

import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import DiscordChannelPostModel, {
  DiscordChannelPostAttributes,
  DiscordChannelPostStatus,
} from '../models/DiscordChannelPost'
import Time from '../utils/date/Time'
import logger from '../utils/logger'

import type { ChannelMessage } from './discord'

import Discord = require('discord.js')

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
  // Update links are built on it. Not the production host, which would send errors down the rollbar path.
  GOVERNANCE_API: 'https://governance.decentraland.zone/api',
}))

// Set before the require: the service reads the channel id into a module constant at import time.
process.env.DISCORD_CHANNEL_ID = 'governance-channel'

// Imported after the mock so the service picks up the enabled flag.
/* eslint-disable @typescript-eslint/no-var-requires */
const { DiscordService } = require('./discord')
// The update service imports the discord one, so it has to wait for the channel id as well.
const { UpdateService } = require('./update')
/* eslint-enable @typescript-eslint/no-var-requires */

const NEW_PROPOSAL_COLOR = 0x0099ff

// Queueing runs in the background; this lets it settle.
async function flushBackgroundTasks() {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setImmediate(resolve))
  }
}

function stubClient(client: Record<string, unknown>) {
  ;(DiscordService as unknown as { client: unknown }).client = client
}

function stubChannel(send: jest.Mock, type = Discord.ChannelType.GuildText) {
  const fetchChannel = jest.fn().mockResolvedValue({ type, send })
  stubClient({ channels: { fetch: fetchChannel } })
  return fetchChannel
}

function createPost(overrides: Partial<DiscordChannelPostAttributes> = {}): DiscordChannelPostAttributes {
  const message: ChannelMessage = {
    url: 'https://decentraland.org/governance/proposal/?id=1',
    title: 'Ban the name test',
    fields: [],
    action: 'Proposal has ended with outcome Passed',
    color: 0x8142f5,
  }
  return {
    id: 'post-1',
    message,
    status: DiscordChannelPostStatus.Sending,
    attempts: 1,
    next_attempt_at: new Date(),
    error: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }
}

function getQueuedMessage(enqueue: jest.SpyInstance): ChannelMessage {
  return enqueue.mock.calls[0][0]
}

describe('DiscordService channel posts', () => {
  let enqueue: jest.SpyInstance
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    enqueue = jest.spyOn(DiscordChannelPostModel, 'enqueue').mockResolvedValue('post-1')
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('newProposal', () => {
    describe('when a proposal is created', () => {
      let send: jest.Mock

      beforeEach(async () => {
        send = jest.fn()
        stubChannel(send)
        DiscordService.newProposal(
          '1',
          'Ban the name test',
          ProposalType.BanName,
          'Should test be banned?',
          ['yes', 'no'],
          '0xabc'
        )
        await flushBackgroundTasks()
      })

      it('should queue the announcement', () => {
        expect(getQueuedMessage(enqueue)).toEqual({
          url: expect.stringContaining('1'),
          title: 'Ban the name test',
          proposalType: ProposalType.BanName,
          description: 'Should test be banned?',
          fields: [
            { name: 'Option #1', value: 'Yes' },
            { name: 'Option #2', value: 'No' },
          ],
          user: '0xabc',
          action: 'A new proposal has been created',
          color: NEW_PROPOSAL_COLOR,
        })
      })

      // The job sending the queue posts it, and retries it if it does not go out.
      it('should not post it to the channel directly', () => {
        expect(send).not.toHaveBeenCalled()
      })
    })

    // Discord rejects a message with more than 25 fields, and polls take any number of options.
    describe('when a poll has more options than a message can hold', () => {
      let fields: ChannelMessage['fields']

      beforeEach(async () => {
        const choices = Array.from({ length: 30 }, (_, idx) => `choice ${idx + 1}`)
        DiscordService.newProposal('1', 'Pick one', ProposalType.Poll, 'Which one?', choices, '0xabc')
        await flushBackgroundTasks()
        fields = getQueuedMessage(enqueue).fields
      })

      it('should keep within the field limit, counting the type and spacer fields', () => {
        expect(fields).toHaveLength(23)
      })

      it('should say how many options were left out', () => {
        expect(fields[fields.length - 1]).toEqual({ name: 'More options', value: '…and 8 more' })
      })
    })

    describe('when a poll has exactly as many options as fit', () => {
      let fields: ChannelMessage['fields']

      beforeEach(async () => {
        const choices = Array.from({ length: 23 }, (_, idx) => `choice ${idx + 1}`)
        DiscordService.newProposal('1', 'Pick one', ProposalType.Poll, 'Which one?', choices, '0xabc')
        await flushBackgroundTasks()
        fields = getQueuedMessage(enqueue).fields
      })

      it('should show every option', () => {
        expect(fields[fields.length - 1]).toEqual({ name: 'Option #23', value: 'Choice 23' })
      })
    })

    describe('when queueing fails', () => {
      let queueError: Error

      beforeEach(async () => {
        queueError = new Error('connection refused')
        enqueue.mockRejectedValue(queueError)
        DiscordService.newProposal(
          '1',
          'Ban the name test',
          ProposalType.BanName,
          'Should test be banned?',
          [],
          '0xabc'
        )
        await flushBackgroundTasks()
      })

      // Reported through the service's error path, which reaches rollbar in production.
      it('should report it', () => {
        expect(consoleError).toHaveBeenCalledWith('Error queueing Discord channel post', queueError, {
          proposalId: '1',
        })
      })
    })
  })

  describe('finishProposal', () => {
    describe('when a poll finishes', () => {
      beforeEach(async () => {
        DiscordService.finishProposal('1', 'Pick one', ProposalStatus.Finished, 'choice 2')
        await flushBackgroundTasks()
      })

      it('should queue the outcome with the winning choice', () => {
        expect(getQueuedMessage(enqueue)).toEqual(
          expect.objectContaining({
            title: 'Pick one',
            fields: [{ name: 'Result', value: 'Choice 2' }],
            action: expect.stringMatching(/^Proposal has ended with outcome /),
          })
        )
      })
    })
  })

  describe('newUpdate', () => {
    describe('when a project update is published', () => {
      beforeEach(async () => {
        jest.spyOn(UpdateService, 'getAllByProposalId').mockResolvedValue([
          {
            id: 'update-1',
            proposal_id: '1',
            health: 'onTrack',
            introduction: 'x'.repeat(200),
            highlights: 'Shipped',
            blockers: 'None',
            next_steps: 'More',
            due_date: new Date(Date.now() - Time.Day),
            completion_date: new Date(),
          },
        ] as never)
        DiscordService.newUpdate('1', 'The project', 'update-1', '0xabc')
        await flushBackgroundTasks()
      })

      it('should queue it numbered against the project', () => {
        expect(getQueuedMessage(enqueue).title).toBe('Update #1: The project')
      })

      // The suffix went missing when the service moved out of the back folder.
      it('should mark a preview that had to be cut', () => {
        const introduction = getQueuedMessage(enqueue).fields.find(({ name }) => name === 'Introduction')
        expect(introduction?.value).toBe(`${'x'.repeat(140)}...`)
      })
    })

    describe('when the update cannot be read', () => {
      beforeEach(async () => {
        jest.spyOn(UpdateService, 'getAllByProposalId').mockRejectedValue(new Error('timeout'))
        DiscordService.newUpdate('1', 'The project', 'update-1', '0xabc')
        await flushBackgroundTasks()
      })

      it('should report it instead of failing silently in the background', () => {
        expect(consoleError).toHaveBeenCalledWith('Error queueing new update message for Discord', expect.any(Error), {
          proposalId: '1',
          updateId: 'update-1',
        })
      })
    })
  })

  describe('sendQueuedChannelPosts', () => {
    let claimDue: jest.SpyInstance
    let markSent: jest.SpyInstance
    let markFailed: jest.SpyInstance
    let retryLater: jest.SpyInstance
    let send: jest.Mock

    beforeEach(() => {
      claimDue = jest.spyOn(DiscordChannelPostModel, 'claimDue').mockResolvedValue([])
      markSent = jest.spyOn(DiscordChannelPostModel, 'markSent').mockResolvedValue(1)
      markFailed = jest.spyOn(DiscordChannelPostModel, 'markFailed').mockResolvedValue(1)
      retryLater = jest.spyOn(DiscordChannelPostModel, 'retryLater').mockResolvedValue(1)
      send = jest.fn().mockResolvedValue({ crosspost: jest.fn() })
    })

    describe('when the queue has posts due', () => {
      let fetchChannel: jest.Mock
      let sent: number

      beforeEach(async () => {
        fetchChannel = stubChannel(send)
        claimDue.mockResolvedValue([createPost({ id: 'post-1' }), createPost({ id: 'post-2' })])
        sent = await DiscordService.sendQueuedChannelPosts()
      })

      it('should post each to the channel', () => {
        expect(send).toHaveBeenCalledTimes(2)
      })

      it('should mark each as sent', () => {
        expect(markSent.mock.calls).toEqual([['post-1'], ['post-2']])
      })

      it('should answer how many went out', () => {
        expect(sent).toBe(2)
      })

      // The cache only fills once the gateway is ready, so a cache-only lookup fails after a restart.
      it('should look the channel up through the api rather than only the cache', () => {
        expect(fetchChannel).toHaveBeenCalledWith('governance-channel')
      })
    })

    describe('when a queued governance proposal is sent', () => {
      let embed: APIEmbed

      beforeEach(async () => {
        stubChannel(send)
        claimDue.mockResolvedValue([
          createPost({
            message: {
              title: 'A poll',
              proposalType: ProposalType.Poll,
              description: 'y'.repeat(200),
              fields: [],
              color: NEW_PROPOSAL_COLOR,
            },
          }),
        ])
        await DiscordService.sendQueuedChannelPosts()
        embed = send.mock.calls[0][0].embeds[0].toJSON()
      })

      it('should mark the cut in its description preview', () => {
        expect(embed.fields?.[0].value).toBe(`${'y'.repeat(140)}...`)
      })
    })

    describe('when sending fails for the first time', () => {
      let sendError: Error

      beforeEach(async () => {
        stubChannel(send)
        sendError = new Error('Service Unavailable')
        send.mockRejectedValue(sendError)
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-12T12:00:00.000Z').getTime())
        claimDue.mockResolvedValue([createPost({ attempts: 1 })])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should put it back to be retried in a minute', () => {
        expect(retryLater).toHaveBeenCalledWith(
          'post-1',
          'Error: Service Unavailable',
          new Date('2026-10-12T12:01:00.000Z')
        )
      })

      it('should report it', () => {
        expect(consoleError).toHaveBeenCalledWith('Error sending queued Discord channel post', sendError, {
          postId: 'post-1',
          attempts: 1,
        })
      })

      it('should not mark it as sent', () => {
        expect(markSent).not.toHaveBeenCalled()
      })
    })

    describe('when a retry fails again', () => {
      beforeEach(async () => {
        stubChannel(send)
        send.mockRejectedValue(new Error('Service Unavailable'))
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-12T12:00:00.000Z').getTime())
        claimDue.mockResolvedValue([createPost({ attempts: 3 })])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should wait twice as long as the time before', () => {
        expect(retryLater.mock.calls[0][2]).toEqual(new Date('2026-10-12T12:04:00.000Z'))
      })

      // The first failure was reported already; repeating it every retry would only add noise.
      it('should not report it again', () => {
        expect(consoleError).not.toHaveBeenCalled()
      })
    })

    describe('when the doubling delay would pass an hour', () => {
      beforeEach(async () => {
        stubChannel(send)
        send.mockRejectedValue(new Error('Service Unavailable'))
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-10-12T12:00:00.000Z').getTime())
        claimDue.mockResolvedValue([createPost({ attempts: 8 })])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should cap it at an hour', () => {
        expect(retryLater.mock.calls[0][2]).toEqual(
          new Date(new Date('2026-10-12T12:00:00.000Z').getTime() + Time.Hour)
        )
      })
    })

    describe('when the last attempt fails', () => {
      let sendError: Error

      beforeEach(async () => {
        stubChannel(send)
        sendError = new Error('Service Unavailable')
        send.mockRejectedValue(sendError)
        claimDue.mockResolvedValue([createPost({ attempts: 10 })])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should give up on it', () => {
        expect(markFailed).toHaveBeenCalledWith('post-1', 'Error: Service Unavailable')
      })

      it('should not schedule another attempt', () => {
        expect(retryLater).not.toHaveBeenCalled()
      })

      it('should report that it gave up', () => {
        expect(consoleError).toHaveBeenCalledWith('Gave up sending queued Discord channel post', sendError, {
          postId: 'post-1',
          attempts: 10,
        })
      })
    })

    // A message discord would reject is built the same way on every retry.
    describe('when the message cannot be built', () => {
      beforeEach(async () => {
        stubChannel(send)
        claimDue.mockResolvedValue([
          createPost({ message: { title: 'Broken', fields: [{ name: 'Result', value: '' }], color: 0x8142f5 } }),
        ])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should fail it at once', () => {
        expect(markFailed).toHaveBeenCalledWith('post-1', expect.any(String))
      })

      it('should not try to send it', () => {
        expect(send).not.toHaveBeenCalled()
      })

      it('should report it', () => {
        expect(consoleError).toHaveBeenCalledWith('Error building queued Discord channel post', expect.anything(), {
          postId: 'post-1',
        })
      })
    })

    describe('when the channel is not one messages can be posted to', () => {
      beforeEach(async () => {
        stubChannel(send, Discord.ChannelType.GuildVoice)
        claimDue.mockResolvedValue([createPost()])
        await DiscordService.sendQueuedChannelPosts()
      })

      it('should treat it as a failed send and retry later', () => {
        expect(retryLater).toHaveBeenCalledWith('post-1', expect.stringContaining('not supported'), expect.any(Date))
      })
    })

    // Sent but unrecorded, the post stays claimed rather than going out twice, and the batch goes on.
    describe('when a sent post cannot be recorded as sent', () => {
      let sent: number

      beforeEach(async () => {
        stubChannel(send)
        markSent.mockRejectedValueOnce(new Error('connection reset'))
        claimDue.mockResolvedValue([createPost({ id: 'post-1' }), createPost({ id: 'post-2' })])
        sent = await DiscordService.sendQueuedChannelPosts()
      })

      it('should not put it back to be retried', () => {
        expect(retryLater).not.toHaveBeenCalled()
      })

      it('should report it', () => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error recording queued Discord channel post outcome',
          expect.any(Error),
          { postId: 'post-1' }
        )
      })

      it('should still send the rest of the batch', () => {
        expect(send).toHaveBeenCalledTimes(2)
      })

      it('should count only what was recorded as sent', () => {
        expect(sent).toBe(1)
      })
    })
  })

  describe('sendDirectMessage', () => {
    let dmSend: jest.Mock
    let loggerLog: jest.SpyInstance

    beforeEach(() => {
      dmSend = jest.fn()
      stubClient({
        users: { fetch: jest.fn().mockResolvedValue({ createDM: jest.fn().mockResolvedValue({ send: dmSend }) }) },
      })
      loggerLog = jest.spyOn(logger, 'log').mockImplementation(() => undefined)
    })

    // Members who left the server or do not accept messages from it would otherwise raise an alert on
    // every notification sent their way.
    describe('when the user does not accept direct messages', () => {
      beforeEach(async () => {
        dmSend.mockRejectedValue(
          new Discord.DiscordAPIError(
            { code: 50007, message: 'Cannot send messages to this user' },
            Discord.RESTJSONErrorCodes.CannotSendMessagesToThisUser,
            403,
            'POST',
            '/channels/dm/messages',
            { body: undefined, files: undefined }
          )
        )
        DiscordService.sendDirectMessage('discord-user', { title: 'Hi', fields: [] })
        await flushBackgroundTasks()
      })

      it('should not report it as an error', () => {
        expect(consoleError).not.toHaveBeenCalled()
      })

      it('should log it', () => {
        expect(loggerLog).toHaveBeenCalledWith('Discord user cannot receive direct messages', {
          userId: 'discord-user',
        })
      })
    })

    describe('when sending fails for any other reason', () => {
      beforeEach(async () => {
        dmSend.mockRejectedValue(new Error('Service Unavailable'))
        DiscordService.sendDirectMessage('discord-user', { title: 'Hi', fields: [] })
        await flushBackgroundTasks()
      })

      it('should still report it', () => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error sending direct message to user with ID discord-user',
          expect.any(Error)
        )
      })
    })
  })
})
