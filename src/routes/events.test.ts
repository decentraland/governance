import { Server } from 'http'
import supertest from 'supertest'

import { EventsService } from '../services/events'

import events from './events'
import { createTestApp } from './testApp'

const DEBUG_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const REGULAR_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
const PROPOSAL_ID = '00000000-0000-0000-0000-000000000001'

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

describe('the event routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(events)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // The unfiltered feed is not the same as the public activity ticker, so it is debug-only.
  describe('GET /api/events/all', () => {
    let getAll: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getAll = jest.spyOn(EventsService, 'getAll').mockResolvedValue([] as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/events/all')
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not read the events', () => {
        expect(getAll).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is signed in but not a debug address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/events/all').set('x-test-auth', REGULAR_ADDRESS)
      })

      it('should refuse the request', () => {
        expect(response.status).toBe(401)
      })

      it('should not read the events', () => {
        expect(getAll).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is a debug address', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/events/all').set('x-test-auth', DEBUG_ADDRESS)
      })

      it('should read the events', () => {
        expect(getAll).toHaveBeenCalled()
      })
    })
  })

  describe('POST /api/events/voted', () => {
    let voted: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      voted = jest.spyOn(EventsService, 'voted').mockResolvedValue({} as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).post('/api/events/voted').send({ proposalId: PROPOSAL_ID, choice: 'yes' })
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not record a vote event', () => {
        expect(voted).not.toHaveBeenCalled()
      })
    })

    describe('when the proposal id is not a uuid', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/events/voted')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ proposalId: 'not-a-uuid', choice: 'yes' })
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not record a vote event', () => {
        expect(voted).not.toHaveBeenCalled()
      })
    })

    describe('when the choice is missing', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/api/events/voted')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ proposalId: PROPOSAL_ID })
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })

      it('should not record a vote event', () => {
        expect(voted).not.toHaveBeenCalled()
      })
    })

    // The event is attributed to the authenticated address, not to one the client names.
    describe('when the caller names a different address in the body', () => {
      beforeEach(async () => {
        await supertest(app)
          .post('/api/events/voted')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ proposalId: PROPOSAL_ID, choice: 'yes', address: DEBUG_ADDRESS })
      })

      it('should attribute the vote to the authenticated address', () => {
        expect(voted).toHaveBeenCalledWith(PROPOSAL_ID, 'yes', REGULAR_ADDRESS)
      })
    })
  })

  describe('GET /api/events', () => {
    let getLatest: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getLatest = jest.spyOn(EventsService, 'getLatest').mockResolvedValue([] as never)
    })

    describe('when no filters are given', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/events')
      })

      it('should serve the ticker without requiring authentication', () => {
        expect(response.status).toBe(200)
      })

      it('should read the latest events', () => {
        expect(getLatest).toHaveBeenCalled()
      })
    })

    describe('when the event type filter is not a known one', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/events?event_type=not-an-event')
      })

      it('should reject the request', () => {
        // Refused rather than served. The status itself is known-wrong — a plain Error becomes a
        // 500 where this should be a client error — and is fixed in the follow-up, so asserting
        // refusal here means that fix will not have to rewrite this.
        expect(response.body.ok).toBe(false)
      })

      it('should not read any events', () => {
        expect(getLatest).not.toHaveBeenCalled()
      })
    })
  })
})
