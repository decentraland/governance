import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { ErrorService } from '../services/ErrorService'
import { DiscordService } from '../services/discord'

import { sendQueuedDiscordPosts } from './SendQueuedDiscordPosts'

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

jest.mock('decentraland-server')
jest.mock('@pushprotocol/restapi/src/index.js', () => jest.fn())

// The job reads the flag when it runs, so flipping it on the mocked module is enough.
const constants = jest.requireMock('../constants') as { DISCORD_SERVICE_ENABLED: boolean }

function createContext() {
  return { log: jest.fn() } as unknown as JobContext
}

describe('sendQueuedDiscordPosts', () => {
  let sendQueuedChannelPosts: jest.SpyInstance
  let report: jest.SpyInstance

  beforeEach(() => {
    constants.DISCORD_SERVICE_ENABLED = true
    sendQueuedChannelPosts = jest.spyOn(DiscordService, 'sendQueuedChannelPosts').mockResolvedValue(0)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Claiming while nothing can be posted would burn the attempts of every queued post.
  describe('when discord is disabled', () => {
    beforeEach(async () => {
      constants.DISCORD_SERVICE_ENABLED = false
      await sendQueuedDiscordPosts(createContext())
    })

    it('should leave the queue alone', () => {
      expect(sendQueuedChannelPosts).not.toHaveBeenCalled()
    })
  })

  describe('when queued posts go out', () => {
    let context: JobContext

    beforeEach(async () => {
      sendQueuedChannelPosts.mockResolvedValue(3)
      context = createContext()
      await sendQueuedDiscordPosts(context)
    })

    it('should log how many were sent', () => {
      expect(context.log).toHaveBeenCalledWith('Sent 3 queued Discord channel posts...')
    })
  })

  describe('when nothing was due', () => {
    let context: JobContext

    beforeEach(async () => {
      context = createContext()
      await sendQueuedDiscordPosts(context)
    })

    it('should log nothing', () => {
      expect(context.log).not.toHaveBeenCalled()
    })
  })

  describe('when the queue cannot be read', () => {
    let queueError: Error

    beforeEach(async () => {
      queueError = new Error('connection refused')
      sendQueuedChannelPosts.mockRejectedValue(queueError)
      await sendQueuedDiscordPosts(createContext())
    })

    it('should report the failure instead of throwing', () => {
      expect(report).toHaveBeenCalledWith(
        'Error sending queued Discord channel posts',
        expect.objectContaining({ error: queueError })
      )
    })
  })
})
