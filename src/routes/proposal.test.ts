import { Server } from 'http'
import supertest from 'supertest'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { DiscourseService } from '../services/DiscourseService'
import { ProposalService } from '../services/ProposalService'
import * as validations from '../utils/validations'

import proposal from './proposal'
import { createTestApp } from './testApp'

const COUNCIL_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
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

// The submission thresholds come from the environment and are unset in tests. Number(undefined) is
// NaN and every comparison against NaN is false, so without pinning one the voting-power gate is a
// no-op and this suite would assert nothing about it.
jest.mock('../entities/Proposal/constants', () => ({
  ...jest.requireActual('../entities/Proposal/constants'),
  SUBMISSION_THRESHOLD_POLL: '100',
}))

// validateIsDaoCouncil reads the council list through this module, so mocking it here is what makes
// the council gate controllable without reaching for environment variables.
jest.mock('../entities/Council/IsDAOCouncil', () => ({
  __esModule: true,
  default: (address?: string) => address === '0x2AC89522CB415AC333E64F52a1a5693218cEBD58',
}))

describe('the proposal routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(proposal)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('PATCH /api/proposals/:proposal', () => {
    let updateProposalStatus: jest.SpyInstance
    let getProposalWithProject: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      updateProposalStatus = jest.spyOn(ProposalService, 'updateProposalStatus').mockResolvedValue({} as never)
      getProposalWithProject = jest
        .spyOn(ProposalService, 'getProposalWithProject')
        .mockResolvedValue(createTestProposal(ProposalType.Governance, ProposalStatus.Passed) as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).patch(`/api/proposals/${PROPOSAL_ID}`).send({ status: ProposalStatus.Enacted })
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not change the proposal status', () => {
        expect(updateProposalStatus).not.toHaveBeenCalled()
      })
    })

    // Status transitions are council-only: enacting or rejecting a proposal moves treasury money.
    describe('when the caller is authenticated but not on the dao council', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .patch(`/api/proposals/${PROPOSAL_ID}`)
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ status: ProposalStatus.Enacted })
      })

      it('should respond with a 403', () => {
        expect(response.status).toBe(403)
      })

      it('should not change the proposal status', () => {
        expect(updateProposalStatus).not.toHaveBeenCalled()
      })

      it('should reject before even loading the proposal', () => {
        expect(getProposalWithProject).not.toHaveBeenCalled()
      })
    })

    describe('when a council member updates a proposal that does not exist', () => {
      beforeEach(async () => {
        getProposalWithProject.mockRejectedValue(new Error('not found'))
        response = await supertest(app)
          .patch(`/api/proposals/${PROPOSAL_ID}`)
          .set('x-test-auth', COUNCIL_ADDRESS)
          .send({ status: ProposalStatus.Enacted })
      })

      it('should respond with a 404, proving the council gate let it through', () => {
        expect(response.status).toBe(404)
      })
    })

    describe('when a council member requests a transition the proposal cannot make', () => {
      beforeEach(async () => {
        getProposalWithProject.mockResolvedValue(createTestProposal(ProposalType.Poll, ProposalStatus.Active) as never)
        response = await supertest(app)
          .patch(`/api/proposals/${PROPOSAL_ID}`)
          .set('x-test-auth', COUNCIL_ADDRESS)
          .send({ status: ProposalStatus.Enacted })
      })

      it('should reject the transition', () => {
        expect(response.status).toBe(400)
      })

      it('should not change the proposal status', () => {
        expect(updateProposalStatus).not.toHaveBeenCalled()
      })
    })

    describe('when a council member enacts a passed governance proposal', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .patch(`/api/proposals/${PROPOSAL_ID}`)
          .set('x-test-auth', COUNCIL_ADDRESS)
          .send({ status: ProposalStatus.Enacted })
      })

      it('should apply the transition', () => {
        expect(updateProposalStatus).toHaveBeenCalledTimes(1)
      })

      it('should record the council member as the acting user', () => {
        expect(updateProposalStatus).toHaveBeenCalledWith(expect.anything(), expect.anything(), COUNCIL_ADDRESS)
      })
    })
  })

  describe('DELETE /api/proposals/:proposal', () => {
    let removeProposal: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      removeProposal = jest.spyOn(ProposalService, 'removeProposal').mockResolvedValue(true as never)
      jest
        .spyOn(ProposalService, 'getProposal')
        .mockResolvedValue(createTestProposal(ProposalType.Poll, ProposalStatus.Active) as never)
    })

    describe('when the caller is unauthenticated', () => {
      beforeEach(async () => {
        response = await supertest(app).delete(`/api/proposals/${PROPOSAL_ID}`)
      })

      it('should respond with a 401', () => {
        expect(response.status).toBe(401)
      })

      it('should not delete the proposal', () => {
        expect(removeProposal).not.toHaveBeenCalled()
      })
    })

    // Whether the caller may delete is decided from this address, so the route must pass the
    // authenticated one rather than anything the client supplied.
    describe('when an authenticated caller deletes a proposal', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .delete(`/api/proposals/${PROPOSAL_ID}`)
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({ user: COUNCIL_ADDRESS })
      })

      it('should pass the authenticated address to the removal check', () => {
        expect(removeProposal).toHaveBeenCalledWith(expect.anything(), REGULAR_ADDRESS, expect.any(Date), PROPOSAL_ID)
      })
    })
  })

  describe('the proposal creation routes', () => {
    const authGatedPaths = [
      '/api/proposals/poll',
      '/api/proposals/draft',
      '/api/proposals/governance',
      '/api/proposals/ban-name',
      '/api/proposals/poi',
      '/api/proposals/catalyst',
      '/api/proposals/grant',
      '/api/proposals/linked-wearables',
      '/api/proposals/pitch',
      '/api/proposals/tender',
      '/api/proposals/bid',
      '/api/proposals/hiring',
      '/api/proposals/council-decision-veto',
    ]

    describe('when an unauthenticated caller posts to any of them', () => {
      let statuses: number[]

      beforeEach(async () => {
        const responses = await Promise.all(authGatedPaths.map((path) => supertest(app).post(path).send({})))
        statuses = responses.map((response) => response.status)
      })

      it('should reject every one with a 401', () => {
        expect(statuses).toEqual(authGatedPaths.map(() => 401))
      })
    })
  })

  describe('the proposal types that are not open for submission', () => {
    const disabledPaths = ['/api/proposals/grant', '/api/proposals/linked-wearables', '/api/proposals/pitch']

    describe('when an authenticated caller posts to them', () => {
      let statuses: number[]

      beforeEach(async () => {
        jest
          .spyOn(SnapshotGraphql, 'get')
          .mockReturnValue({ getVpDistribution: jest.fn().mockResolvedValue({ total: 1000000 }) } as never)
        const responses = await Promise.all(
          disabledPaths.map((path) => supertest(app).post(path).set('x-test-auth', REGULAR_ADDRESS).send({}))
        )
        statuses = responses.map((response) => response.status)
      })

      it('should refuse each with a 403', () => {
        expect(statuses).toEqual(disabledPaths.map(() => 403))
      })
    })
  })

  describe('POST /api/proposals/poll', () => {
    let response: supertest.Response

    describe('when the author does not hold the required voting power', () => {
      beforeEach(async () => {
        jest
          .spyOn(SnapshotGraphql, 'get')
          .mockReturnValue({ getVpDistribution: jest.fn().mockResolvedValue({ total: 0 }) } as never)
        response = await supertest(app)
          .post('/api/proposals/poll')
          .set('x-test-auth', REGULAR_ADDRESS)
          .send({
            title: 'A poll title',
            description: 'A description long enough to satisfy the schema minimum',
            choices: ['a', 'b'],
          })
      })

      it('should refuse with a 403', () => {
        expect(response.status).toBe(403)
      })
    })

    describe('when the body does not match the poll schema', () => {
      beforeEach(async () => {
        jest
          .spyOn(SnapshotGraphql, 'get')
          .mockReturnValue({ getVpDistribution: jest.fn().mockResolvedValue({ total: 1000000 }) } as never)
        response = await supertest(app).post('/api/proposals/poll').set('x-test-auth', REGULAR_ADDRESS).send({})
      })

      it('should reject the request', () => {
        expect(response.status).toBe(400)
      })
    })
  })

  describe('GET /api/proposals/:proposal', () => {
    let getProposalWithProject: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getProposalWithProject = jest
        .spyOn(ProposalService, 'getProposalWithProject')
        .mockResolvedValue(createTestProposal(ProposalType.Poll, ProposalStatus.Active) as never)
    })

    describe('when the id is not a uuid', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/proposals/not-a-uuid')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not query for the proposal', () => {
        expect(getProposalWithProject).not.toHaveBeenCalled()
      })
    })

    describe('when the proposal does not exist', () => {
      beforeEach(async () => {
        getProposalWithProject.mockRejectedValue(new Error('missing'))
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}`)
      })

      it('should respond with a 404', () => {
        expect(response.status).toBe(404)
      })
    })

    describe('when the proposal exists', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}`)
      })

      it('should respond with a 200', () => {
        expect(response.status).toBe(200)
      })
    })
  })

  describe('GET /api/proposals/priority/:address?', () => {
    let getPriorityProposals: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getPriorityProposals = jest.spyOn(ProposalService, 'getPriorityProposals').mockResolvedValue([] as never)
    })

    describe('when no address is given', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/proposals/priority')
      })

      it('should query without an address', () => {
        expect(getPriorityProposals).toHaveBeenCalledWith(undefined)
      })
    })

    describe('when the address is valid', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/proposals/priority/${REGULAR_ADDRESS}`)
      })

      it('should query for that address', () => {
        expect(getPriorityProposals).toHaveBeenCalledWith(REGULAR_ADDRESS)
      })
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/proposals/priority/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the query', () => {
        expect(getPriorityProposals).not.toHaveBeenCalled()
      })
    })
  })

  describe('GET /api/proposals', () => {
    let getProposalList: jest.SpyInstance
    let getProposalTotal: jest.SpyInstance

    beforeEach(() => {
      getProposalList = jest.spyOn(ProposalModel, 'getProposalList').mockResolvedValue([] as never)
      getProposalTotal = jest.spyOn(ProposalModel, 'getProposalTotal').mockResolvedValue(0 as never)
    })

    describe('when no filters are given', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/proposals')
      })

      it('should apply the default offset and limit', () => {
        expect(getProposalList).toHaveBeenCalledWith(expect.objectContaining({ offset: 0, limit: 100 }))
      })
    })

    describe('when the search term is too short to be meaningful', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app).get('/api/proposals?search=a')
      })

      it('should return an empty list without querying', () => {
        expect(getProposalList).not.toHaveBeenCalled()
      })

      it('should not count totals either', () => {
        expect(getProposalTotal).not.toHaveBeenCalled()
      })

      it('should respond with a 200', () => {
        expect(response.status).toBe(200)
      })
    })

    // The term reaches a full-text parser that backtracks super-linearly, and this route is
    // unauthenticated, so an unbounded term is a single-request stall of the whole event loop.
    describe('and the search term is longer than the allowed length', () => {
      let response: supertest.Response

      beforeEach(async () => {
        response = await supertest(app).get(`/api/proposals?search=${'a'.repeat(101)}`)
      })

      it('should return an empty list without querying', () => {
        expect(getProposalList).not.toHaveBeenCalled()
      })

      it('should not count totals either', () => {
        expect(getProposalTotal).not.toHaveBeenCalled()
      })

      it('should respond with a 200', () => {
        expect(response.status).toBe(200)
      })
    })

    describe('and the search term is exactly the allowed length', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/proposals?search=${'a'.repeat(100)}`)
      })

      it('should still run the query', () => {
        expect(getProposalList).toHaveBeenCalled()
      })
    })

    describe('when the linked proposal id is not a uuid', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/proposals?linkedProposalId=not-a-uuid')
      })

      it('should drop the filter rather than pass it through', () => {
        expect(getProposalList).toHaveBeenCalledWith(expect.objectContaining({ linkedProposalId: undefined }))
      })
    })

    describe('when the subscribed filter is used by an unauthenticated caller', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/proposals?subscribed=true')
      })

      // Optional auth: without a caller there is no subscription set, so the filter must not
      // silently widen to everyone's proposals.
      it('should filter on an empty subscriber rather than none', () => {
        expect(getProposalList).toHaveBeenCalledWith(expect.objectContaining({ subscribed: '' }))
      })
    })

    describe('when the subscribed filter is used by an authenticated caller', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/proposals?subscribed=true').set('x-test-auth', REGULAR_ADDRESS)
      })

      it('should filter on that caller', () => {
        expect(getProposalList).toHaveBeenCalledWith(expect.objectContaining({ subscribed: REGULAR_ADDRESS }))
      })
    })
  })

  describe('GET /api/proposals/:proposal/comments', () => {
    let response: supertest.Response

    beforeEach(() => {
      jest
        .spyOn(ProposalService, 'getProposal')
        .mockResolvedValue(createTestProposal(ProposalType.Poll, ProposalStatus.Active) as never)
    })

    describe('when discourse is unreachable', () => {
      beforeEach(async () => {
        jest.spyOn(DiscourseService, 'getPostComments').mockRejectedValue(new Error('discourse down'))
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/comments`)
      })

      it('should respond with a 200 rather than failing the page', () => {
        expect(response.status).toBe(200)
      })

      it('should return an empty comment set', () => {
        expect(response.body.data).toEqual({ comments: [], totalComments: 0 })
      })
    })
  })

  describe('GET /api/proposals/linked-wearables/image', () => {
    let isValidImage: jest.SpyInstance

    beforeEach(() => {
      isValidImage = jest.spyOn(validations, 'isValidImage').mockResolvedValue(false)
    })

    describe('when an image url is given', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/proposals/linked-wearables/image?url=https://untrusted.example/a.png')
      })

      it('should check it against the trusted domains', () => {
        expect(isValidImage).toHaveBeenCalledWith('https://untrusted.example/a.png')
      })
    })
  })
})
