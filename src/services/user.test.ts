import UserModel from '../entities/User/model'

import { DiscourseService } from './DiscourseService'
import { UserService } from './user'

const ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'

describe('UserService.getProfile', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the address has no stored user', () => {
    let profile: Awaited<ReturnType<typeof UserService.getProfile>>

    beforeEach(async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue(undefined as never)
      profile = await UserService.getProfile(ADDRESS)
    })

    it('should return an empty profile for that address', () => {
      expect(profile).toEqual({ address: ADDRESS })
    })
  })

  describe('when the stored user has a linked forum account', () => {
    let profile: Awaited<ReturnType<typeof UserService.getProfile>>

    beforeEach(async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValue({
        address: ADDRESS.toLowerCase(),
        forum_id: 123,
        forum_verification_date: undefined,
        discord_verification_date: undefined,
      } as never)
      jest.spyOn(DiscourseService, 'getUserById').mockResolvedValue({ username: 'forum-user' } as never)
      profile = await UserService.getProfile(ADDRESS)
    })

    it('should include the resolved forum username', () => {
      expect(profile.forum_username).toBe('forum-user')
    })
  })

  // This runs behind the unauthenticated GET /user/:address and the message reaches the response
  // body, so neither the stack nor a raw thrown value may be folded into it.
  describe('when the lookup throws an error', () => {
    let lookupError: Error
    let thrown: Error

    beforeEach(async () => {
      lookupError = new Error('connection terminated unexpectedly')
      lookupError.stack =
        'Error: connection terminated unexpectedly\n    at Connection.<anonymous> (/srv/app/src/internal/secretModule.ts:42:13)'
      jest.spyOn(UserModel, 'findOne').mockRejectedValue(lookupError)
      thrown = (await UserService.getProfile(ADDRESS).catch((error) => error)) as Error
    })

    it('should surface only the underlying message', () => {
      expect(thrown.message).toBe('Error while fetching profile data: connection terminated unexpectedly')
    })

    it('should not leak internal paths from the stack trace', () => {
      expect(thrown.message).not.toContain('secretModule.ts')
    })

    it('should not include the word Stack, which preceded the leaked trace', () => {
      expect(thrown.message).not.toContain('Stack')
    })
  })

  describe('when the lookup rejects with a non-error value', () => {
    let thrown: Error

    beforeEach(async () => {
      jest.spyOn(UserModel, 'findOne').mockRejectedValue({ host: 'db-primary.internal', password: 'redacted' })
      thrown = (await UserService.getProfile(ADDRESS).catch((error) => error)) as Error
    })

    it('should report a fixed message rather than interpolating the thrown value', () => {
      expect(thrown.message).toBe('Unexpected error while fetching profile data')
    })

    it('should not leak the internal host from the rejected value', () => {
      expect(thrown.message).not.toContain('db-primary.internal')
    })
  })
})
