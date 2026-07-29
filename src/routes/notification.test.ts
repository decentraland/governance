import { Server } from 'http'
import supertest from 'supertest'

import { NotificationService } from '../services/notification'

import notification from './notification'
import { createTestApp } from './testApp'

const VALID_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'

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

describe('GET /api/notifications/user/:address', () => {
  let app: Server
  let getUserFeed: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(notification)
    getUserFeed = jest.spyOn(NotificationService, 'getUserFeed').mockResolvedValue([] as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the address is a valid ethereum address', () => {
    beforeEach(async () => {
      response = await supertest(app).get(`/api/notifications/user/${VALID_ADDRESS}`)
    })

    it('should respond with a 200', () => {
      expect(response.status).toBe(200)
    })

    it('should pass the address through to the feed', () => {
      expect(getUserFeed).toHaveBeenCalledWith(VALID_ADDRESS)
    })
  })

  // The address is interpolated into a CAIP id and an outbound Push feed URL, so it has to be
  // rejected at the edge rather than forwarded.
  describe('when the address is not an ethereum address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/notifications/user/not-an-address')
    })

    it('should respond with a 400', () => {
      expect(response.status).toBe(400)
    })

    it('should not build a feed request from it', () => {
      expect(getUserFeed).not.toHaveBeenCalled()
    })
  })

  describe('when the address carries a query injection payload', () => {
    beforeEach(async () => {
      response = await supertest(app).get(`/api/notifications/user/${VALID_ADDRESS}%3Fenv%3Dstaging`)
    })

    it('should respond with a 400', () => {
      expect(response.status).toBe(400)
    })

    it('should not reach the outbound feed call', () => {
      expect(getUserFeed).not.toHaveBeenCalled()
    })
  })

  describe('when a path traversal payload is used as the address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/notifications/user/..%2F..%2Fadmin')
    })

    it('should not reach the outbound feed call', () => {
      expect(getUserFeed).not.toHaveBeenCalled()
    })
  })
})

describe('the authenticated notification routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(notification)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when an unauthenticated caller sends a notification', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app).post('/api/notifications/send').send({ title: 'hi' })
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })
  })

  describe('when an unauthenticated caller reads the last notification', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(app).get('/api/notifications/last-notification')
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })
  })
})
