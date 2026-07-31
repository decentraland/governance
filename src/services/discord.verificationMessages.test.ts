import { Collection } from 'discord.js'

import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'

import Discord = require('discord.js')

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

// Set before the require: the service reads the channel id into a module constant at import time.
process.env.DISCORD_PROFILE_VERIFICATION_CHANNEL_ID = 'verification-channel'

// Imported after the mock so the service picks up the enabled flag.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DiscordService } = require('./discord')

type FakeMessage = {
  id: string
  content: string
  createdTimestamp: number
  author: { id: string; bot: boolean }
}

function createMessage(id: string, createdTimestamp: number, overrides: Partial<FakeMessage> = {}): FakeMessage {
  return {
    id,
    content: `content-${id}`,
    createdTimestamp,
    author: { id: `author-${id}`, bot: false },
    ...overrides,
  }
}

// Mirrors channel.messages.fetch: newest first, honouring limit and the before cursor.
function createFetchMock(newestFirst: FakeMessage[]) {
  return jest.fn(async ({ limit, before }: { limit: number; before?: string }) => {
    let pool = newestFirst
    if (before) {
      const cursor = pool.findIndex((message) => message.id === before)
      // Rather than silently restarting from the newest message, which would hide a broken cursor
      // behind a test that still passes.
      if (cursor < 0) {
        throw new Error(`before cursor not found: ${before}`)
      }
      pool = pool.slice(cursor + 1)
    }
    return new Collection(pool.slice(0, limit).map((message) => [message.id, message]))
  })
}

function stubChannel(fetch: jest.Mock) {
  const channel = { type: Discord.ChannelType.GuildText, messages: { fetch } }
  ;(DiscordService as unknown as { client: unknown }).client = {
    channels: { fetch: jest.fn().mockResolvedValue(channel) },
  }
}

function clearVerificationCache() {
  const service = DiscordService as unknown as {
    verificationMessagesCache?: unknown
    verificationMessagesRequest?: unknown
  }
  service.verificationMessagesCache = undefined
  service.verificationMessagesRequest = undefined
}

describe('DiscordService.getProfileVerificationMessages', () => {
  let now: number

  beforeEach(() => {
    clearVerificationCache()
    now = Date.now()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when a verification message is followed by more messages than a single legacy page held', () => {
    let fetch: jest.Mock
    let returned: FakeMessage[]

    beforeEach(async () => {
      // Regression case: the copy plus nine fillers used to push the original out of view.
      const original = createMessage('original', now - 4000)
      const copy = createMessage('copy', now - 3000)
      const fillers = Array.from({ length: 9 }, (_, index) => createMessage(`filler-${index}`, now - 2000 + index))
      fetch = createFetchMock([...fillers.reverse(), copy, original])
      stubChannel(fetch)
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should still return the original verification message', () => {
      expect(returned.map((message) => message.id)).toContain('original')
    })

    it('should return the copy alongside it so the ambiguity check can see both', () => {
      expect(returned.map((message) => message.id)).toEqual(expect.arrayContaining(['original', 'copy']))
    })
  })

  describe('when the messages inside the validation window span more than one page', () => {
    let fetch: jest.Mock
    let returned: FakeMessage[]

    beforeEach(async () => {
      const messages = Array.from({ length: 150 }, (_, index) => createMessage(`m-${index}`, now - 1000 - index))
      fetch = createFetchMock(messages)
      stubChannel(fetch)
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should page past the first fetch to cover the whole window', () => {
      expect(returned).toHaveLength(150)
    })

    it('should stop on the short page rather than spend a fetch proving the channel is empty', () => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  // Nothing older exists, so the window is covered even though its oldest message is still inside
  // it. A full final page cannot show that, so the budget is only usable up to a short page.
  describe('and the last page inside the budget is short', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      const messages = Array.from({ length: 499 }, (_, index) => createMessage(`m-${index}`, now - 1000))
      stubChannel(createFetchMock(messages))
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should return them rather than refuse', () => {
      expect(returned).toHaveLength(499)
    })
  })

  // The ordinary production path: a full page whose oldest message already predates the window.
  describe('when a full page reaches past the start of the window', () => {
    let fetch: jest.Mock
    let returned: FakeMessage[]

    beforeEach(async () => {
      const inWindow = Array.from({ length: 150 }, (_, index) => createMessage(`recent-${index}`, now - 1000 - index))
      const expired = Array.from({ length: 100 }, (_, index) =>
        createMessage(`expired-${index}`, now - MESSAGE_TIMEOUT_TIME - 1000 - index)
      )
      fetch = createFetchMock([...inWindow, ...expired])
      stubChannel(fetch)
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should stop there rather than keep paging', () => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should return only the messages inside the window', () => {
      expect(returned).toHaveLength(150)
    })
  })

  describe('when the channel is empty', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      stubChannel(createFetchMock([]))
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should return nothing', () => {
      expect(returned).toEqual([])
    })
  })

  describe('when another caller asks for messages while a fetch is still in flight', () => {
    let fetch: jest.Mock
    let firstResult: FakeMessage[]
    let secondResult: FakeMessage[]

    beforeEach(async () => {
      let resolveFetch: ((messages: Collection<string, FakeMessage>) => void) | undefined
      const pendingFetch = new Promise<Collection<string, FakeMessage>>((resolve) => {
        resolveFetch = resolve
      })
      fetch = jest.fn().mockReturnValue(pendingFetch)
      stubChannel(fetch)

      const first = DiscordService.getProfileVerificationMessages()
      const second = DiscordService.getProfileVerificationMessages()
      resolveFetch?.(new Collection([['original', createMessage('original', now - 1000)]]))
      ;[firstResult, secondResult] = await Promise.all([first, second])
    })

    it('should coalesce both callers into one Discord fetch', () => {
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should return the same fetched window to both callers', () => {
      expect([firstResult[0].id, secondResult[0].id]).toEqual(['original', 'original'])
    })
  })

  describe('when messages predate the validation window', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      const inWindow = createMessage('recent', now - 1000)
      const expired = createMessage('expired', now - MESSAGE_TIMEOUT_TIME - 1000)
      stubChannel(createFetchMock([inWindow, expired]))
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should return only the message inside the window', () => {
      expect(returned.map((message) => message.id)).toEqual(['recent'])
    })
  })

  describe('when the channel contains bot messages', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      const fromBot = createMessage('bot', now - 1000, { author: { id: 'author-bot', bot: true } })
      const fromUser = createMessage('user', now - 2000)
      stubChannel(createFetchMock([fromBot, fromUser]))
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should exclude the bot message', () => {
      expect(returned.map((message) => message.id)).toEqual(['user'])
    })
  })

  // A partial read is taken from the newest end, so it can hold a copy while hiding the original.
  describe('when the window holds more messages than the fetch budget covers', () => {
    let fetch: jest.Mock
    let returned: FakeMessage[]

    beforeEach(async () => {
      const messages = Array.from({ length: 2000 }, (_, index) => createMessage(`m-${index}`, now - 1000))
      fetch = createFetchMock(messages)
      stubChannel(fetch)
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should stop at the page cap instead of paging without bound', () => {
      expect(fetch).toHaveBeenCalledTimes(5)
    })

    it('should return nothing rather than a subset that could hide the original', () => {
      expect(returned).toEqual([])
    })

    it('should not spend the page budget again on the next poll inside the cache window', async () => {
      fetch.mockClear()
      await DiscordService.getProfileVerificationMessages()
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('when the channel cannot be resolved', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      ;(DiscordService as unknown as { client: unknown }).client = {
        channels: { fetch: jest.fn().mockResolvedValue(null) },
      }
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should return nothing rather than throw', () => {
      expect(returned).toEqual([])
    })
  })

  describe('when the configured channel is not a text channel', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      ;(DiscordService as unknown as { client: unknown }).client = {
        channels: { fetch: jest.fn().mockResolvedValue({ type: Discord.ChannelType.GuildVoice, messages: {} }) },
      }
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should return nothing rather than read it', () => {
      expect(returned).toEqual([])
    })
  })

  describe('when a verification message is deleted', () => {
    let deleteMessage: jest.Mock
    let fetch: jest.Mock

    beforeEach(async () => {
      fetch = createFetchMock([createMessage('original', now - 1000)])
      deleteMessage = jest.fn().mockResolvedValue(undefined)
      const channel = { type: Discord.ChannelType.GuildText, messages: { fetch, delete: deleteMessage } }
      ;(DiscordService as unknown as { client: unknown }).client = {
        channels: { fetch: jest.fn().mockResolvedValue(channel) },
      }

      await DiscordService.getProfileVerificationMessages()
      await DiscordService.deleteVerificationMessage('original')
    })

    it('should delete the matched message', () => {
      expect(deleteMessage).toHaveBeenCalledWith('original')
    })

    it('should drop the cached window so the deleted message is not matched again', async () => {
      fetch.mockClear()
      await DiscordService.getProfileVerificationMessages()
      expect(fetch).toHaveBeenCalled()
    })
  })

  // The link has already been written by this point, so a failed delete must not turn a completed
  // verification into an error.
  describe('when deleting the message fails', () => {
    let thrown: Error | undefined

    beforeEach(async () => {
      const channel = {
        type: Discord.ChannelType.GuildText,
        messages: { fetch: createFetchMock([]), delete: jest.fn().mockRejectedValue(new Error('missing access')) },
      }
      ;(DiscordService as unknown as { client: unknown }).client = {
        channels: { fetch: jest.fn().mockResolvedValue(channel) },
      }
      thrown = await DiscordService.deleteVerificationMessage('original').then(
        () => undefined,
        (error: Error) => error
      )
    })

    it('should not propagate the failure', () => {
      expect(thrown).toBeUndefined()
    })
  })

  describe('and the channel settles back inside the fetch budget', () => {
    let returned: FakeMessage[]

    beforeEach(async () => {
      const flooded = Array.from({ length: 2000 }, (_, index) => createMessage(`m-${index}`, now - 1000))
      stubChannel(createFetchMock(flooded))
      await DiscordService.getProfileVerificationMessages()

      clearVerificationCache()
      stubChannel(createFetchMock([createMessage('original', now - 1000), createMessage('old', now - 400000)]))
      returned = await DiscordService.getProfileVerificationMessages()
    })

    it('should read the window again rather than stay poisoned by the partial read', () => {
      expect(returned.map((message) => message.id)).toEqual(['original'])
    })
  })
})
