import { Server } from 'http'
import supertest from 'supertest'

import AirdropJobModel from '../models/AirdropJob'
import BidService from '../services/BidService'
import { ErrorService } from '../services/ErrorService'
import { SurveyTopicsService } from '../services/SurveyTopicsService'

import airdrop from './airdrop'
import bid from './bid'
import committee from './committee'
import council from './council'
import newsletter from './newsletter'
import surveyTopics from './surveyTopics'
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

describe('GET /api/airdrops/all', () => {
  let app: Server
  let getAll: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(airdrop)
    getAll = jest.spyOn(AirdropJobModel, 'getAll').mockResolvedValue([] as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // The airdrop queue names every pending badge recipient, so it is debug-only.
  describe('when the caller is unauthenticated', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/airdrops/all')
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })

    it('should not read the queue', () => {
      expect(getAll).not.toHaveBeenCalled()
    })
  })

  describe('when the caller is signed in but not a debug address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/airdrops/all').set('x-test-auth', REGULAR_ADDRESS)
    })

    it('should refuse the request', () => {
      expect(response.status).toBe(401)
    })

    it('should not read the queue', () => {
      expect(getAll).not.toHaveBeenCalled()
    })
  })

  describe('when the caller is a debug address', () => {
    beforeEach(async () => {
      await supertest(app).get('/api/airdrops/all').set('x-test-auth', DEBUG_ADDRESS)
    })

    it('should read the queue', () => {
      expect(getAll).toHaveBeenCalled()
    })
  })
})

describe('the bid routes', () => {
  let app: Server
  let getUserBidOnTender: jest.SpyInstance

  beforeEach(() => {
    app = createTestApp(bid)
    getUserBidOnTender = jest.spyOn(BidService, 'getUserBidOnTender').mockResolvedValue(null as never)
    jest.spyOn(BidService, 'getBidsInfoByTender').mockResolvedValue({} as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/bids/:tenderId/get-user-bid', () => {
    describe('when the caller is authenticated', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/bids/${PROPOSAL_ID}/get-user-bid`).set('x-test-auth', REGULAR_ADDRESS)
      })

      it('should look up the bid for that caller', () => {
        expect(getUserBidOnTender).toHaveBeenCalledWith(REGULAR_ADDRESS, PROPOSAL_ID)
      })
    })

    // Auth is optional, so an anonymous caller reaches the handler with no address.
    describe('when the caller is anonymous', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app).get(`/api/bids/${PROPOSAL_ID}/get-user-bid`)
      })

      it('should respond with a 200', () => {
        expect(response.status).toBe(200)
      })

      it('should look up a bid for no address rather than for somebody else', () => {
        expect(getUserBidOnTender).toHaveBeenCalledWith(undefined, PROPOSAL_ID)
      })
    })
  })
})

describe('the public address lists', () => {
  describe('GET /api/committee', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(createTestApp(committee)).get('/api/committee')
    })

    // Deliberately public, unlike the debug address list which is gated.
    it('should be served without authentication', () => {
      expect(response.status).toBe(200)
    })

    it('should return a list', () => {
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/dao-council', () => {
    let response: supertest.Response

    beforeEach(async () => {
      response = await supertest(createTestApp(council)).get('/api/dao-council')
    })

    it('should be served without authentication', () => {
      expect(response.status).toBe(200)
    })

    it('should return a list', () => {
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })
})

describe('GET /api/proposals/:proposal/survey-topics', () => {
  let app: Server
  let getProposalSurveyTopics: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(surveyTopics)
    getProposalSurveyTopics = jest.spyOn(SurveyTopicsService, 'getProposalSurveyTopics').mockResolvedValue([] as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when a proposal id is given', () => {
    beforeEach(async () => {
      response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/survey-topics`)
    })

    it('should look up its topics', () => {
      expect(getProposalSurveyTopics).toHaveBeenCalledWith(PROPOSAL_ID)
    })

    it('should be served without authentication', () => {
      expect(response.status).toBe(200)
    })
  })
})

describe('POST /api/newsletter-subscribe', () => {
  let app: Server
  let response: supertest.Response
  let report: jest.SpyInstance

  beforeEach(() => {
    app = createTestApp(newsletter)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the email is not an email', () => {
    beforeEach(async () => {
      global.fetch = jest.fn() as never
      response = await supertest(app).post('/api/newsletter-subscribe').send({ email: 'not-an-email' })
    })

    it('should respond with a 400', () => {
      expect(response.status).toBe(400)
    })

    it('should not call the newsletter provider', () => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  // Recorded, not endorsed: isEmail throws on a non-string rather than returning false, so an
  // omitted email surfaces as a 500 on a public endpoint instead of the 400 the branch intends.
  describe('when the email is missing', () => {
    beforeEach(async () => {
      global.fetch = jest.fn() as never
      response = await supertest(app).post('/api/newsletter-subscribe').send({})
    })

    it('should fail rather than subscribe nobody', () => {
      // Recorded, not endorsed: isEmail throws on a non-string instead of returning false.
      expect(response.status).toBe(500)
    })

    it('should not call the newsletter provider', () => {
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('when the provider accepts the subscription', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ data: { id: 'sub_1' } }) }) as never
      response = await supertest(app).post('/api/newsletter-subscribe').send({ email: 'someone@example.com' })
    })

    it('should report no error', () => {
      expect(response.body.data).toEqual({ email: 'someone@example.com', error: false, details: '' })
    })
  })

  // The provider's rejection is surfaced in the body rather than as a failed request.
  describe('when the provider rejects the subscription', () => {
    beforeEach(async () => {
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ errors: ['nope'] }) }) as never
      response = await supertest(app).post('/api/newsletter-subscribe').send({ email: 'someone@example.com' })
    })

    it('should still respond successfully', () => {
      expect(response.status).toBe(201)
    })

    it('should mark the result as failed', () => {
      expect(response.body.data.error).toBe(true)
    })

    it('should report it server-side', () => {
      expect(report).toHaveBeenCalled()
    })
  })
})
