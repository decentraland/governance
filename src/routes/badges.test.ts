import { Server } from 'http'
import supertest from 'supertest'

import { storeBadgeSpec } from '../entities/Badges/storeBadgeSpec'
import { ActionStatus } from '../entities/Badges/types'
import { BadgesService } from '../services/BadgesService'
import { createSpec } from '../utils/contractInteractions'

import badges from './badges'
import { createTestApp } from './testApp'

const DEBUG_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const REGULAR_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
const RECIPIENT = '0x49E4DbfF86a2E5DA27c540c9A9E8D2C3726E278F'
const BADGE_CID = 'bafybeib-badge-spec-cid'

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

jest.mock('../entities/Debug/isDebugAddress', () => ({
  __esModule: true,
  default: (address?: string) => address === '0x2AC89522CB415AC333E64F52a1a5693218cEBD58',
}))

jest.mock('../entities/Badges/storeBadgeSpec', () => ({ storeBadgeSpec: jest.fn() }))
jest.mock('../utils/contractInteractions', () => ({ createSpec: jest.fn() }))

// Airdropping and revoking badges are privileged actions, so every write here is gated on the
// caller being a debug address rather than merely signed in.
describe('the badge routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(badges)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('POST /api/badges/airdrop', () => {
    let giveBadgeToUsers: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      giveBadgeToUsers = jest.spyOn(BadgesService, 'giveBadgeToUsers').mockResolvedValue({} as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT] })
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not hand out any badge', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is signed in but not a debug address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT] })
      })

      it('should refuse the airdrop', () => {
        expect(response.status).toBe(401)
      })

      it('should not hand out any badge', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    describe('when a recipient is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT, 'not-an-address'] })
      })

      it('should reject the whole request', () => {
        expect(response.status).toBe(400)
      })

      it('should not hand out a badge to the valid recipients either', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    describe('when the badge spec cid is missing', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ recipients: [RECIPIENT] })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })

      it('should not hand out any badge', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    describe('when a debug address omits the recipient list entirely', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID })
      })

      it('should reject it as a bad request rather than fail on the dereference', () => {
        expect(response.status).toBe(400)
      })

      it('should not hand out any badge', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    // A number or an object has no length, so a truthiness check alone let it reach the service.
    describe('when the badge spec cid is not a string', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: 12345, recipients: [RECIPIENT] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not hand out any badge', () => {
        expect(giveBadgeToUsers).not.toHaveBeenCalled()
      })
    })

    describe('when a debug address airdrops to valid recipients', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/airdrop/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT] })
      })

      it('should hand out the badge to exactly those recipients', () => {
        expect(giveBadgeToUsers).toHaveBeenCalledWith(BADGE_CID, [RECIPIENT])
      })

      it('should respond successfully', () => {
        expect(response.status).toBe(201)
      })
    })
  })

  describe('POST /api/badges/revoke', () => {
    let revokeBadge: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      revokeBadge = jest.spyOn(BadgesService, 'revokeBadge').mockResolvedValue([] as never)
    })

    describe('when the caller is signed in but not a debug address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/revoke/')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT] })
      })

      it('should refuse the revocation', () => {
        expect(response.status).toBe(401)
      })

      it('should not revoke anything', () => {
        expect(revokeBadge).not.toHaveBeenCalled()
      })
    })

    describe('when the reason is not one the contract accepts', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/revoke/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT], reason: 'because I said so' })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })

      it('should not revoke anything', () => {
        expect(revokeBadge).not.toHaveBeenCalled()
      })
    })

    describe('when no reason is given', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/revoke/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: [RECIPIENT] })
      })

      it('should revoke without one rather than inventing a default', () => {
        expect(revokeBadge).toHaveBeenCalledWith(BADGE_CID, [RECIPIENT], undefined)
      })
    })

    describe('when a recipient is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/revoke/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: BADGE_CID, recipients: ['not-an-address'] })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })
    })

    // Mirrors the airdrop case: revoke got the same guard, so it gets the same coverage.
    describe('when the badge spec cid is not a string', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/revoke/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeSpecCid: 12345, recipients: [RECIPIENT] })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not revoke anything', () => {
        expect(revokeBadge).not.toHaveBeenCalled()
      })
    })
  })

  describe('POST /api/badges/upload-badge-spec', () => {
    let response: supertest.Response
    const spec = { title: 'A badge', description: 'What it is for', imgUrl: 'https://example.com/badge.png' }

    describe('when the caller is signed in but not a debug address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/upload-badge-spec/')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send(spec)
      })

      it('should refuse the upload', () => {
        expect(response.status).toBe(401)
      })

      it('should not store a spec', () => {
        expect(storeBadgeSpec).not.toHaveBeenCalled()
      })
    })

    describe('when a required field is missing', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/upload-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ title: 'A badge', description: 'What it is for' })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })

      it('should not store a spec', () => {
        expect(storeBadgeSpec).not.toHaveBeenCalled()
      })
    })

    describe('when the expiry is not a date', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/upload-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ ...spec, expiresAt: 'whenever' })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })
    })

    describe('when a debug address uploads a valid spec', () => {
      beforeEach(async () => {
        ;(storeBadgeSpec as jest.Mock).mockResolvedValue({ badgeCid: BADGE_CID })
        response = await supertest(app)
          .post('/api/badges/upload-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send(spec)
      })

      it('should report success with the stored cid', () => {
        expect(response.body.data).toEqual({ status: ActionStatus.Success, badgeCid: BADGE_CID })
      })
    })

    // Storage failures are reported in the body rather than as an error status, so the client sees
    // a structured outcome instead of a 500.
    describe('when storing the spec fails', () => {
      beforeEach(async () => {
        ;(storeBadgeSpec as jest.Mock).mockRejectedValue(new Error('ipfs unavailable'))
        response = await supertest(app)
          .post('/api/badges/upload-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send(spec)
      })

      it('should still respond successfully', () => {
        expect(response.status).toBe(201)
      })

      it('should report the failure in the body', () => {
        expect(response.body.data.status).toBe(ActionStatus.Failed)
      })
    })
  })

  describe('POST /api/badges/create-badge-spec', () => {
    let response: supertest.Response

    describe('when the caller is signed in but not a debug address', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/create-badge-spec/')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ badgeCid: BADGE_CID })
      })

      it('should refuse the request', () => {
        expect(response.status).toBe(401)
      })

      it('should not create a spec on chain', () => {
        expect(createSpec).not.toHaveBeenCalled()
      })
    })

    describe('when the badge cid is missing', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/badges/create-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({})
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })

      it('should not create a spec on chain', () => {
        expect(createSpec).not.toHaveBeenCalled()
      })
    })

    describe('when a debug address creates a spec', () => {
      beforeEach(async () => {
        ;(createSpec as jest.Mock).mockResolvedValue({ hash: '0xabc' })
        response = await supertest(app)
          .post('/api/badges/create-badge-spec/')
          .set('x-test-auth', DEBUG_ADDRESS)
          .send({ badgeCid: BADGE_CID })
      })

      it('should create it with the given cid', () => {
        expect(createSpec).toHaveBeenCalledWith(BADGE_CID)
      })

      it('should report success', () => {
        expect(response.body.data.status).toBe(ActionStatus.Success)
      })
    })
  })

  describe('GET /api/badges/:address', () => {
    let getBadges: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getBadges = jest.spyOn(BadgesService, 'getBadges').mockResolvedValue({} as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/badges/not-an-address/')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the lookup', () => {
        expect(getBadges).not.toHaveBeenCalled()
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/badges/${RECIPIENT}/`)
      })

      it('should look up that address without requiring authentication', () => {
        expect(getBadges).toHaveBeenCalledWith(RECIPIENT)
      })
    })
  })
})
