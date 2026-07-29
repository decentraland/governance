import UserModel from '../../src/entities/User/model'
import { AccountType } from '../../src/entities/User/types'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'

const ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const OTHER_ADDRESS = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
const FORUM_ID = '1234'
const DISCORD_ID = 'discord-user-1'

/**
 * These decide whether a wallet counts as having a linked forum or discord account, which gates
 * what the ui offers and what notifications are sent. isValidated in particular compares a Postgres
 * COUNT against a string, which only holds because the driver returns bigint as one.
 */
describe('the user account queries', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
  })

  describe('isValidated', () => {
    describe('when the wallet has no stored user at all', () => {
      it('should report it as not validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum]))).toBe(false)
      })
    })

    describe('when the wallet has a linked forum account', () => {
      beforeEach(async () => {
        await UserModel.createForumConnection(ADDRESS, FORUM_ID)
      })

      it('should report the forum account as validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum]))).toBe(true)
      })

      it('should not report discord as validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Discord]))).toBe(false)
      })

      // Asking about both requires both, so a partially linked wallet does not pass.
      it('should refuse when both accounts are required', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum, AccountType.Discord]))).toBe(false)
      })
    })

    describe('when the wallet has both accounts linked', () => {
      beforeEach(async () => {
        await UserModel.createForumConnection(ADDRESS, FORUM_ID)
        await UserModel.createDiscordConnection(ADDRESS, DISCORD_ID)
      })

      it('should report both as validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum, AccountType.Discord]))).toBe(true)
      })
    })

    describe('when the wallet is asked about in a different case', () => {
      beforeEach(async () => {
        await UserModel.createForumConnection(ADDRESS, FORUM_ID)
      })

      it('should still recognise it, since the address is lowercased on both sides', async () => {
        expect(await UserModel.isValidated(ADDRESS.toLowerCase(), new Set([AccountType.Forum]))).toBe(true)
      })
    })

    describe('when no accounts are asked about', () => {
      it('should refuse rather than answer for nothing', async () => {
        await expect(UserModel.isValidated(ADDRESS, new Set())).rejects.toThrow('No accounts provided')
      })
    })
  })

  describe('createForumConnection', () => {
    describe('when the wallet links a forum account twice', () => {
      beforeEach(async () => {
        await UserModel.createForumConnection(ADDRESS, FORUM_ID)
        await UserModel.createForumConnection(ADDRESS, '5678')
      })

      it('should replace the link rather than fail on the existing row', async () => {
        const [found] = await UserModel.getAddressesByForumId(['5678'])
        expect(found?.address).toBe(ADDRESS.toLowerCase())
      })

      it('should no longer resolve the previous forum id', async () => {
        expect(await UserModel.getAddressesByForumId([FORUM_ID])).toEqual([])
      })
    })

    // A forum account belongs to one wallet, enforced by a unique constraint rather than by code.
    describe('when a second wallet claims the same forum account', () => {
      let outcome: unknown

      beforeEach(async () => {
        await UserModel.createForumConnection(ADDRESS, FORUM_ID)
        outcome = await UserModel.createForumConnection(OTHER_ADDRESS, FORUM_ID).catch((error) => error)
      })

      it('should refuse the second claim', () => {
        expect(outcome).toBeInstanceOf(Error)
      })

      it('should leave the first wallet holding it', async () => {
        const [found] = await UserModel.getAddressesByForumId([FORUM_ID])
        expect(found?.address).toBe(ADDRESS.toLowerCase())
      })
    })
  })

  describe('unlinkAccount', () => {
    beforeEach(async () => {
      await UserModel.createForumConnection(ADDRESS, FORUM_ID)
      await UserModel.createDiscordConnection(ADDRESS, DISCORD_ID)
    })

    describe('when the forum account is unlinked', () => {
      beforeEach(async () => {
        await UserModel.unlinkAccount(ADDRESS, AccountType.Forum)
      })

      it('should no longer report it as validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum]))).toBe(false)
      })

      it('should leave the discord account linked', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Discord]))).toBe(true)
      })

      // Clearing the id has to free it, otherwise the unique constraint locks the account forever.
      it('should free the forum id for another wallet to claim', async () => {
        await UserModel.createForumConnection(OTHER_ADDRESS, FORUM_ID)
        const [found] = await UserModel.getAddressesByForumId([FORUM_ID])
        expect(found?.address).toBe(OTHER_ADDRESS)
      })
    })

    describe('when the discord account is unlinked', () => {
      beforeEach(async () => {
        await UserModel.unlinkAccount(ADDRESS, AccountType.Discord)
      })

      it('should no longer report it as validated', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Discord]))).toBe(false)
      })

      it('should leave the forum account linked', async () => {
        expect(await UserModel.isValidated(ADDRESS, new Set([AccountType.Forum]))).toBe(true)
      })
    })
  })

  describe('getAddressesByForumId', () => {
    describe('when no ids are given', () => {
      it('should return nothing without querying', async () => {
        expect(await UserModel.getAddressesByForumId([])).toEqual([])
      })
    })

    describe('when an id belongs to no wallet', () => {
      it('should return nothing', async () => {
        expect(await UserModel.getAddressesByForumId(['9999'])).toEqual([])
      })
    })
  })
})
