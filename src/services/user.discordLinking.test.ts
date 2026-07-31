import { Collection } from 'discord.js'
import { Wallet } from 'ethers'

import Discord = require('discord.js')

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

jest.mock('../entities/User/model', () => ({
  __esModule: true,
  default: {
    createDiscordConnection: jest.fn(),
    createForumConnection: jest.fn(),
  },
}))

// Set before the requires: the service reads the channel id into a module constant at import time.
process.env.DISCORD_PROFILE_VERIFICATION_CHANNEL_ID = 'verification-channel'

// Required after the mocks so both pick up the stubbed module graph.
/* eslint-disable @typescript-eslint/no-var-requires */
const UserModel = require('../entities/User/model').default
const { DiscordService } = require('./discord')
const { UserService } = require('./user')
/* eslint-enable @typescript-eslint/no-var-requires */

const SIGNER_DISCORD_ID = '111111111111111111'
const REPOSTER_DISCORD_ID = '999999999999999999'

type FakeMessage = {
  id: string
  content: string
  createdTimestamp: number
  author: { id: string; bot: boolean }
}

function stubChannelWith(newestFirst: FakeMessage[]) {
  const fetch = jest.fn(async ({ limit, before }: { limit: number; before?: string }) => {
    let pool = newestFirst
    if (before) {
      pool = pool.slice(pool.findIndex((message) => message.id === before) + 1)
    }
    return new Collection(pool.slice(0, limit).map((message) => [message.id, message]))
  })
  const channel = { type: Discord.ChannelType.GuildText, messages: { fetch } }
  ;(DiscordService as unknown as { client: unknown }).client = {
    channels: { fetch: jest.fn().mockResolvedValue(channel) },
  }
  // The service caches the window for a few seconds; drop it so each case reads its own stub.
  ;(DiscordService as unknown as { verificationMessagesCache?: unknown }).verificationMessagesCache = undefined
}

describe('linking a discord account to a dao address', () => {
  let signer: Wallet
  let posted: string
  let now: number
  let createDiscordConnection: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.spyOn(DiscordService, 'deleteVerificationMessage').mockResolvedValue(undefined as never)
    jest.spyOn(DiscordService, 'sendDirectMessage').mockReturnValue(undefined as never)
    createDiscordConnection = UserModel.createDiscordConnection as jest.Mock

    now = Date.now()
    signer = Wallet.createRandom()
    // The real route: GET /user/validate issues the message and opens the validation window.
    const message = UserService.getValidationMessage(signer.address, 'discord')
    const signature = await signer.signMessage(message)
    posted = `${message}\n\n${signature}`
  })

  afterEach(() => {
    const inProgress = (
      UserService as unknown as {
        VALIDATIONS_IN_PROGRESS: Record<string, { message_timeout: NodeJS.Timeout }>
      }
    ).VALIDATIONS_IN_PROGRESS
    Object.keys(inProgress).forEach((address) => {
      clearTimeout(inProgress[address].message_timeout)
      delete inProgress[address]
    })
    jest.restoreAllMocks()
  })

  describe('when only the genuine signer posted their verification message', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      result = await UserService.validateDiscordUser(signer.address)
    })

    it('should report the validation as valid', () => {
      expect(result.valid).toBe(true)
    })

    it('should link the discord account of the genuine signer', () => {
      expect(createDiscordConnection).toHaveBeenCalledWith(signer.address, SIGNER_DISCORD_ID)
    })
  })

  describe('when another account reposts the verification message verbatim', () => {
    let thrown: Error

    beforeEach(async () => {
      stubChannelWith([
        { id: 'a', content: posted, createdTimestamp: now + 1200, author: { id: REPOSTER_DISCORD_ID, bot: false } },
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      thrown = (await UserService.validateDiscordUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should refuse the ambiguous match', () => {
      expect(thrown.message).toBe('Multiple Discord accounts posted the same valid verification message')
    })

    it('should not link any discord account', () => {
      expect(createDiscordConnection).not.toHaveBeenCalled()
    })
  })

  describe('and the reposting account floods the channel to hide the original message', () => {
    let thrown: Error

    beforeEach(async () => {
      const fillers: FakeMessage[] = Array.from({ length: 40 }, (_, index) => ({
        id: `filler-${index}`,
        content: `gm ${index}`,
        createdTimestamp: now + 2000 + index,
        author: { id: REPOSTER_DISCORD_ID, bot: false },
      }))
      stubChannelWith([
        ...fillers.reverse(),
        { id: 'a', content: posted, createdTimestamp: now + 1200, author: { id: REPOSTER_DISCORD_ID, bot: false } },
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      thrown = (await UserService.validateDiscordUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should still reach the original message and refuse the ambiguous match', () => {
      expect(thrown.message).toBe('Multiple Discord accounts posted the same valid verification message')
    })

    it('should not link the reposting account to the signer address', () => {
      expect(createDiscordConnection).not.toHaveBeenCalledWith(signer.address, REPOSTER_DISCORD_ID)
    })
  })

  describe('and an unsigned copy is posted before the genuine message', () => {
    beforeEach(async () => {
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
        {
          id: 'a',
          content: posted.replace(/0x[a-fA-F\d]{130}/, '0xnotasignature'),
          createdTimestamp: now - 5000,
          author: { id: REPOSTER_DISCORD_ID, bot: false },
        },
      ])
      await UserService.validateDiscordUser(signer.address)
    })

    it('should ignore the unsigned copy and link the genuine signer', () => {
      expect(createDiscordConnection).toHaveBeenCalledWith(signer.address, SIGNER_DISCORD_ID)
    })
  })

  // Discord keeps createdTimestamp on the snowflake when a message is edited, so a decoy posted
  // before the signer can be rewritten afterwards to carry their content while still looking older.
  describe('and the reposting account edits a message it posted before the genuine one', () => {
    beforeEach(async () => {
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
        { id: 'a', content: posted, createdTimestamp: now - 3000, author: { id: REPOSTER_DISCORD_ID, bot: false } },
      ])
      await UserService.validateDiscordUser(signer.address).catch(() => undefined)
    })

    it('should not link the reposting account to the signer address', () => {
      expect(createDiscordConnection).not.toHaveBeenCalledWith(signer.address, REPOSTER_DISCORD_ID)
    })
  })

  describe('when the discord account is already linked to another address', () => {
    let thrown: Error

    beforeEach(async () => {
      createDiscordConnection.mockRejectedValueOnce(Object.assign(new Error('duplicate key'), { code: '23505' }))
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      thrown = (await UserService.validateDiscordUser(signer.address).catch((error: Error) => error)) as Error
    })

    it('should explain the conflict rather than surface the driver error', () => {
      expect(thrown.message).toBe('That Discord account is already linked to another address')
    })
  })

  describe('when deleting the verification message fails after linking', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      jest.spyOn(DiscordService, 'deleteVerificationMessage').mockRejectedValueOnce(new Error('Discord unavailable'))
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      result = await UserService.validateDiscordUser(signer.address)
    })

    it('should still report the persisted link as valid', () => {
      expect(result.valid).toBe(true)
    })

    it('should keep the persisted Discord connection', () => {
      expect(createDiscordConnection).toHaveBeenCalledWith(signer.address, SIGNER_DISCORD_ID)
    })
  })

  describe('when enqueueing the confirmation message fails after linking', () => {
    let result: { valid: boolean }

    beforeEach(async () => {
      jest.spyOn(DiscordService, 'sendDirectMessage').mockImplementationOnce(() => {
        throw new Error('Discord unavailable')
      })
      stubChannelWith([
        { id: 'v', content: posted, createdTimestamp: now, author: { id: SIGNER_DISCORD_ID, bot: false } },
      ])
      result = await UserService.validateDiscordUser(signer.address)
    })

    it('should still report the persisted link as valid', () => {
      expect(result.valid).toBe(true)
    })

    it('should keep the persisted Discord connection', () => {
      expect(createDiscordConnection).toHaveBeenCalledWith(signer.address, SIGNER_DISCORD_ID)
    })
  })
})
