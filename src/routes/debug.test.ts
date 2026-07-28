import { Express } from 'express'
import supertest from 'supertest'

import { ErrorService } from '../services/ErrorService'

import debug from './debug'
import { createTestApp } from './testApp'

const DEBUG_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const REGULAR_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'

// Stands in for a verified auth chain: the address arrives via a header so the route's own
// authorization check is what gets exercised, not the signature verification behind it.
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

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DEBUG_ADDRESSES: ['0x2AC89522CB415AC333E64F52a1a5693218cEBD58'],
}))

describe('GET /api/debug', () => {
  let app: Express
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(debug)
  })

  describe('when the caller is unauthenticated', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/debug')
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })

    it('should not disclose the admin address list', () => {
      expect(JSON.stringify(response.body)).not.toContain(DEBUG_ADDRESS)
    })
  })

  // The hardening this pins: a valid signature from any wallet used to be enough to read exactly
  // which wallets hold admin powers.
  describe('when the caller is authenticated but not a debug address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/debug').set('x-test-auth', REGULAR_ADDRESS)
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })

    it('should not disclose the admin address list', () => {
      expect(JSON.stringify(response.body)).not.toContain(DEBUG_ADDRESS)
    })
  })

  describe('when the caller is a debug address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/debug').set('x-test-auth', DEBUG_ADDRESS)
    })

    it('should respond with a 200', () => {
      expect(response.status).toBe(200)
    })

    it('should return the debug address list in the standard envelope', () => {
      expect(response.body).toEqual({ ok: true, data: [DEBUG_ADDRESS] })
    })
  })
})

describe('POST /api/debug/trigger', () => {
  let app: Express
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(debug)
  })

  describe('when the caller is not a debug address', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/debug/trigger')
        .set('x-test-auth', REGULAR_ADDRESS)
        .send({ functionName: 'runQueuedAirdropJobs' })
    })

    it('should refuse to run the job', () => {
      expect(response.status).toBe(401)
    })
  })

  describe('when a debug address asks for an unknown function', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .post('/api/debug/trigger')
        .set('x-test-auth', DEBUG_ADDRESS)
        .send({ functionName: 'rm -rf' })
    })

    it('should not treat the name as callable', () => {
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})

describe('DELETE /api/debug/invalidate-cache', () => {
  let app: Express
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(debug)
  })

  describe('when the caller is not a debug address', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .delete('/api/debug/invalidate-cache?key=anything')
        .set('x-test-auth', REGULAR_ADDRESS)
    })

    it('should refuse to invalidate the cache', () => {
      expect(response.status).toBe(401)
    })
  })

  describe('when a debug address omits the cache key', () => {
    beforeEach(async () => {
      response = await supertest(app).delete('/api/debug/invalidate-cache').set('x-test-auth', DEBUG_ADDRESS)
    })

    it('should reject the request', () => {
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
})

describe('POST /api/debug/report-error', () => {
  let app: Express
  let report: jest.SpyInstance

  beforeEach(() => {
    app = createTestApp(debug)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when an unauthenticated client reports an error', () => {
    beforeEach(async () => {
      await supertest(app).post('/api/debug/report-error').send({ message: 'boom' })
    })

    // Auth is optional here so the frontend can report before a wallet is connected.
    it('should still record the report', () => {
      expect(report).toHaveBeenCalledWith('boom', expect.objectContaining({ frontend: true }))
    })
  })

  describe('when the reported message is longer than the limit', () => {
    beforeEach(async () => {
      await supertest(app)
        .post('/api/debug/report-error')
        .send({ message: 'x'.repeat(5000) })
    })

    it('should truncate it to a thousand characters', () => {
      expect(report.mock.calls[0][0]).toHaveLength(1000)
    })
  })

  describe('when the message is not a string', () => {
    beforeEach(async () => {
      await supertest(app)
        .post('/api/debug/report-error')
        .send({ message: { nested: true } })
    })

    it('should fall back to a fixed label', () => {
      expect(report).toHaveBeenCalledWith('Unknown client error', expect.objectContaining({ frontend: true }))
    })
  })

  describe('when the client tries to override the frontend marker', () => {
    beforeEach(async () => {
      await supertest(app)
        .post('/api/debug/report-error')
        .send({ message: 'boom', extraInfo: { frontend: false } })
    })

    // extraInfo is spread first precisely so a client cannot disguise its report as server-side.
    it('should keep the trusted marker', () => {
      expect(report).toHaveBeenCalledWith('boom', expect.objectContaining({ frontend: true }))
    })
  })

  describe('when extraInfo is not an object', () => {
    beforeEach(async () => {
      await supertest(app)
        .post('/api/debug/report-error')
        .send({ message: 'boom', extraInfo: ['array'] })
    })

    it('should ignore it rather than spreading an array into the report', () => {
      expect(report).toHaveBeenCalledWith('boom', { frontend: true })
    })
  })
})
