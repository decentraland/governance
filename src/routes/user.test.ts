import { Server } from 'http'
import supertest from 'supertest'

import { AccountType } from '../entities/User/types'
import { UserService } from '../services/user'

import { createTestApp } from './testApp'
import user from './user'

const CALLER = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const SOMEONE_ELSE = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'

jest.mock('decentraland-gatsby/dist/entities/Auth/middleware', () => ({
  auth:
    (options?: { optional?: boolean }) =>
    (
      req: { get: (name: string) => string | undefined; auth?: string },
      res: { status: (code: number) => { json: (body: unknown) => void } },
      next: () => void
    ) => {
      const address = req.get('x-test-auth')
      if (address) {
        req.auth = address
        return next()
      }
      if (options?.optional) {
        return next()
      }
      res.status(401).json({ ok: false, error: 'Unauthorized' })
    },
}))

describe('the user routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(user)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Linking an account binds a wallet to a forum or discord identity, so every one of these must
  // act on the authenticated address and never on one the caller supplied.
  describe('the routes that act on the caller’s own account', () => {
    const authGatedPaths = [
      { method: 'get' as const, path: '/api/user/validate' },
      { method: 'post' as const, path: '/api/user/validate/forum' },
      { method: 'post' as const, path: '/api/user/validate/discord' },
      { method: 'post' as const, path: '/api/user/discord-active' },
      { method: 'get' as const, path: '/api/user/discord-active' },
      { method: 'get' as const, path: '/api/user/discord-linked' },
      { method: 'post' as const, path: '/api/user/unlink' },
    ]

    describe('when the caller is unauthenticated', () => {
      let statuses: number[]

      beforeEach(async () => {
        const responses = await Promise.all(
          authGatedPaths.map(({ method, path }) => supertest(app)[method](path).send({}))
        )
        statuses = responses.map((response) => response.status)
      })

      it('should refuse every one with a 401', () => {
        expect(statuses).toEqual(authGatedPaths.map(() => 401))
      })
    })
  })

  describe('GET /api/user/validate', () => {
    let getValidationMessage: jest.SpyInstance

    beforeEach(() => {
      getValidationMessage = jest.spyOn(UserService, 'getValidationMessage').mockResolvedValue({} as never)
    })

    describe('when an account is named in the query', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/user/validate?account=${AccountType.Forum}`).set('x-test-auth', CALLER)
      })

      it('should build the message for the authenticated address', () => {
        expect(getValidationMessage).toHaveBeenCalledWith(CALLER, AccountType.Forum)
      })
    })

    describe('when no account is named', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/user/validate').set('x-test-auth', CALLER)
      })

      it('should ask without one', () => {
        expect(getValidationMessage).toHaveBeenCalledWith(CALLER, undefined)
      })
    })

    describe('when the account is repeated in the query', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/user/validate?account=forum&account=discord').set('x-test-auth', CALLER)
      })

      it('should ignore the array rather than pass one through', () => {
        expect(getValidationMessage).toHaveBeenCalledWith(CALLER, undefined)
      })
    })
  })

  describe('POST /api/user/validate/forum', () => {
    let validateForumUser: jest.SpyInstance

    beforeEach(() => {
      validateForumUser = jest.spyOn(UserService, 'validateForumUser').mockResolvedValue({} as never)
    })

    describe('when the caller supplies a different address in the body', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/validate/forum')
          .set('x-test-auth', CALLER)
          .send({ address: SOMEONE_ELSE, user: SOMEONE_ELSE })
      })

      it('should link the authenticated address, not the one supplied', () => {
        expect(validateForumUser).toHaveBeenCalledWith(CALLER)
      })
    })
  })

  describe('POST /api/user/validate/discord', () => {
    let validateDiscordUser: jest.SpyInstance

    beforeEach(() => {
      validateDiscordUser = jest.spyOn(UserService, 'validateDiscordUser').mockResolvedValue({} as never)
    })

    describe('when the caller supplies a different address in the body', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/validate/discord')
          .set('x-test-auth', CALLER)
          .send({ address: SOMEONE_ELSE })
      })

      it('should link the authenticated address, not the one supplied', () => {
        expect(validateDiscordUser).toHaveBeenCalledWith(CALLER)
      })
    })
  })

  describe('POST /api/user/discord-active', () => {
    let updateDiscordStatus: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      updateDiscordStatus = jest.spyOn(UserService, 'updateDiscordStatus').mockResolvedValue(undefined as never)
    })

    describe('when the flag is a boolean', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/discord-active')
          .set('x-test-auth', CALLER)
          .send({ is_discord_notifications_active: false })
      })

      it('should apply it to the authenticated address', () => {
        expect(updateDiscordStatus).toHaveBeenCalledWith(CALLER, false)
      })
    })

    // A truthy string would otherwise switch notifications on for a client that meant to send false.
    describe('when the flag is a string rather than a boolean', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/user/discord-active')
          .set('x-test-auth', CALLER)
          .send({ is_discord_notifications_active: 'false' })
      })

      it('should reject the request', () => {
        expect(response.status).toBeGreaterThanOrEqual(400)
      })

      it('should not change the stored setting', () => {
        expect(updateDiscordStatus).not.toHaveBeenCalled()
      })
    })

    describe('when the flag is missing', () => {
      beforeEach(async () => {
        response = await supertest(app).post('/api/user/discord-active').set('x-test-auth', CALLER).send({})
      })

      it('should reject the request', () => {
        expect(response.status).toBeGreaterThanOrEqual(400)
      })

      it('should not change the stored setting', () => {
        expect(updateDiscordStatus).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /api/user/unlink', () => {
    let unlinkAccount: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      unlinkAccount = jest.spyOn(UserService, 'unlinkAccount').mockResolvedValue(undefined as never)
    })

    describe('when a known account type is given', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/unlink')
          .set('x-test-auth', CALLER)
          .send({ accountType: AccountType.Discord })
      })

      it('should unlink it from the authenticated address', () => {
        expect(unlinkAccount).toHaveBeenCalledWith(CALLER, AccountType.Discord)
      })
    })

    describe('when the caller names someone else’s address alongside it', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/unlink')
          .set('x-test-auth', CALLER)
          .send({ accountType: AccountType.Forum, address: SOMEONE_ELSE })
      })

      it('should still unlink from the authenticated address', () => {
        expect(unlinkAccount).toHaveBeenCalledWith(CALLER, AccountType.Forum)
      })
    })

    describe('when the account type is not a known one', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/user/unlink')
          .set('x-test-auth', CALLER)
          .send({ accountType: 'myspace' })
      })

      it('should reject the request', () => {
        expect(response.status).toBeGreaterThanOrEqual(400)
      })

      it('should not unlink anything', () => {
        expect(unlinkAccount).not.toHaveBeenCalled()
      })
    })

    describe('when no account type is given', () => {
      beforeEach(async () => {
        response = await supertest(app).post('/api/user/unlink').set('x-test-auth', CALLER).send({})
      })

      it('should reject the request', () => {
        expect(response.status).toBeGreaterThanOrEqual(400)
      })

      it('should not unlink anything', () => {
        expect(unlinkAccount).not.toHaveBeenCalled()
      })
    })

    // Recorded, not endorsed: only the first of several account types is acted on.
    describe('when several account types are given at once', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/user/unlink')
          .set('x-test-auth', CALLER)
          .send({ accountType: [AccountType.Forum, AccountType.Discord] })
      })

      it('should unlink only the first', () => {
        expect(unlinkAccount).toHaveBeenCalledWith(CALLER, AccountType.Forum)
      })
    })
  })

  describe('GET /api/user/:address', () => {
    let getProfile: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getProfile = jest.spyOn(UserService, 'getProfile').mockResolvedValue({} as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/user/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the lookup', () => {
        expect(getProfile).not.toHaveBeenCalled()
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/user/${SOMEONE_ELSE}`)
      })

      it('should serve the profile without requiring authentication', () => {
        expect(getProfile).toHaveBeenCalledWith(SOMEONE_ELSE)
      })
    })
  })

  describe('GET /api/user/:address/is-validated', () => {
    let isValidated: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      isValidated = jest.spyOn(UserService, 'isValidated').mockResolvedValue(true as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/user/not-an-address/is-validated?account=${AccountType.Forum}`)
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the lookup', () => {
        expect(isValidated).not.toHaveBeenCalled()
      })
    })

    describe('when the account type is not a known one', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/user/${SOMEONE_ELSE}/is-validated?account=myspace`)
      })

      it('should reject the request', () => {
        expect(response.status).toBeGreaterThanOrEqual(400)
      })

      it('should not run the lookup', () => {
        expect(isValidated).not.toHaveBeenCalled()
      })
    })

    describe('when several account types are asked about', () => {
      beforeEach(async () => {
        response = await supertest(app).get(
          `/api/user/${SOMEONE_ELSE}/is-validated?account=${AccountType.Forum}&account=${AccountType.Discord}`
        )
      })

      it('should ask about all of them as a set', () => {
        expect(isValidated).toHaveBeenCalledWith(SOMEONE_ELSE, new Set([AccountType.Forum, AccountType.Discord]))
      })
    })
  })
})
