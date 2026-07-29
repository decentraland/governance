import { Server } from 'http'
import supertest from 'supertest'

import SubscriptionModel from '../entities/Subscription/model'

import subscription from './subscription'
import { createTestApp } from './testApp'

const CALLER = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const SOMEONE_ELSE = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
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

// Stubbed rather than imported: routes/proposal drags in the whole service graph, and all this
// route needs from it is the resolved proposal.
jest.mock('./proposal', () => ({ getProposal: jest.fn() }))

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getProposal } = require('./proposal')

describe('the subscription routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(subscription)
    ;(getProposal as jest.Mock).mockResolvedValue({ id: PROPOSAL_ID })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('GET /api/subscriptions', () => {
    let find: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      find = jest.spyOn(SubscriptionModel, 'find').mockResolvedValue([] as never)
    })

    // Auth is optional here, so an anonymous caller gets an empty list rather than a 401 or, worse,
    // a query for every subscription in the table.
    describe('when the caller is anonymous', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/subscriptions')
      })

      it('should return an empty list', () => {
        expect(response.body.data).toEqual([])
      })

      it('should not query for anyone’s subscriptions', () => {
        expect(find).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is authenticated', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/subscriptions').set('x-test-auth', CALLER)
      })

      it('should query only their own subscriptions', () => {
        expect(find).toHaveBeenCalledWith({ user: CALLER })
      })
    })
  })

  describe('POST /api/proposals/:proposal/subscriptions', () => {
    let create: jest.SpyInstance
    let findOne: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      create = jest.spyOn(SubscriptionModel, 'create').mockResolvedValue({} as never)
      findOne = jest.spyOn(SubscriptionModel, 'findOne').mockResolvedValue(undefined as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).post(`/api/proposals/${PROPOSAL_ID}/subscriptions`)
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not subscribe anyone', () => {
        expect(create).not.toHaveBeenCalled()
      })
    })

    describe('when the caller is not yet subscribed', () => {
      beforeEach(async () => {
        await supertest(app).post(`/api/proposals/${PROPOSAL_ID}/subscriptions`).set('x-test-auth', CALLER)
      })

      it('should subscribe the authenticated address to that proposal', () => {
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ proposal_id: PROPOSAL_ID, user: CALLER }))
      })
    })

    // Subscribing twice is a no-op rather than a duplicate row, since nothing in the schema stops
    // one being written.
    describe('when the caller is already subscribed', () => {
      beforeEach(async () => {
        findOne.mockResolvedValue({ proposal_id: PROPOSAL_ID, user: CALLER, created_at: new Date() })
        response = await supertest(app).post(`/api/proposals/${PROPOSAL_ID}/subscriptions`).set('x-test-auth', CALLER)
      })

      it('should not write a second row', () => {
        expect(create).not.toHaveBeenCalled()
      })

      it('should return the existing subscription', () => {
        expect(response.body.data).toEqual(expect.objectContaining({ user: CALLER }))
      })
    })

    describe('when the caller supplies a different address in the body', () => {
      beforeEach(async () => {
        await supertest(app)
          .post(`/api/proposals/${PROPOSAL_ID}/subscriptions`)
          .set('x-test-auth', CALLER)
          .send({ user: SOMEONE_ELSE })
      })

      it('should subscribe the authenticated address instead', () => {
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ user: CALLER }))
      })
    })
  })

  describe('DELETE /api/proposals/:proposal/subscriptions', () => {
    let remove: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      remove = jest.spyOn(SubscriptionModel, 'delete').mockResolvedValue(1 as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).delete(`/api/proposals/${PROPOSAL_ID}/subscriptions`)
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not unsubscribe anyone', () => {
        expect(remove).not.toHaveBeenCalled()
      })
    })

    // Scoped to the caller, so unsubscribing cannot remove somebody else from a proposal.
    describe('when the caller unsubscribes', () => {
      beforeEach(async () => {
        await supertest(app)
          .delete(`/api/proposals/${PROPOSAL_ID}/subscriptions`)
          .set('x-test-auth', CALLER)
          .send({ user: SOMEONE_ELSE })
      })

      it('should delete only their own subscription to that proposal', () => {
        expect(remove).toHaveBeenCalledWith({ proposal_id: PROPOSAL_ID, user: CALLER })
      })
    })
  })

  describe('GET /api/proposals/:proposal/subscriptions', () => {
    let find: jest.SpyInstance

    beforeEach(() => {
      find = jest.spyOn(SubscriptionModel, 'find').mockResolvedValue([] as never)
    })

    describe('when it is requested', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/subscriptions`)
      })

      it('should list them for that proposal without requiring authentication', () => {
        expect(find).toHaveBeenCalledWith({ proposal_id: PROPOSAL_ID })
      })
    })
  })
})
