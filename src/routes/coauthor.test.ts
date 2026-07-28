import { Express } from 'express'
import supertest from 'supertest'

import CoauthorModel from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'

import coauthor from './coauthor'
import { createTestApp } from './testApp'

const COAUTHOR = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const OTHER_ADDRESS = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
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

function openProposal() {
  return {
    ...createTestProposal(ProposalType.Grant, ProposalStatus.Active),
    finish_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }
}

function finishedProposal() {
  return {
    ...createTestProposal(ProposalType.Grant, ProposalStatus.Passed),
    finish_at: new Date('2020-01-01T00:00:00.000Z'),
  }
}

describe('PUT /api/coauthors/:proposal', () => {
  let app: Express
  let update: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(coauthor)
    update = jest.spyOn(CoauthorModel, 'update').mockResolvedValue({ rowCount: 1 } as never)
    jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(openProposal() as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the caller is unauthenticated', () => {
    beforeEach(async () => {
      response = await supertest(app).put(`/api/coauthors/${PROPOSAL_ID}`).send({ status: CoauthorStatus.APPROVED })
    })

    it('should respond with a 401', () => {
      expect(response.status).toBe(401)
    })

    it('should not touch any invitation', () => {
      expect(update).not.toHaveBeenCalled()
    })
  })

  // Authorization here is the where clause: the row is matched on the caller's own address, so an
  // invitation addressed to somebody else can never be answered on their behalf.
  describe('when an authenticated coauthor answers an invitation', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', COAUTHOR)
        .send({ status: CoauthorStatus.APPROVED })
    })

    it('should scope the update to that proposal and the caller’s own address', () => {
      expect(update).toHaveBeenCalledWith(
        { status: CoauthorStatus.APPROVED },
        { proposal_id: PROPOSAL_ID, address: COAUTHOR.toLowerCase() }
      )
    })

    it('should respond with a 201, the status handleAPI returns for a successful put', () => {
      expect(response.status).toBe(201)
    })

    it('should return the stored invitation', () => {
      expect(response.body.data).toEqual({
        proposal_id: PROPOSAL_ID,
        address: COAUTHOR.toLowerCase(),
        status: CoauthorStatus.APPROVED,
      })
    })
  })

  // The body schema forbids extra properties, so a caller cannot even name the address whose
  // invitation is being answered — the only address in play is the authenticated one.
  describe('when the caller supplies a different address in the body', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', COAUTHOR)
        .send({ status: CoauthorStatus.APPROVED, address: OTHER_ADDRESS })
    })

    it('should reject the request rather than accept a caller-named address', () => {
      expect(response.status).toBe(400)
    })

    it('should not touch any invitation', () => {
      expect(update).not.toHaveBeenCalled()
    })
  })

  describe('when no invitation matches the caller', () => {
    beforeEach(async () => {
      update.mockResolvedValue({ rowCount: 0 } as never)
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', OTHER_ADDRESS)
        .send({ status: CoauthorStatus.APPROVED })
    })

    it('should fail rather than report success for a row it never changed', () => {
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('when voting on the proposal has already finished', () => {
    beforeEach(async () => {
      ;(ProposalModel.findOne as jest.Mock).mockResolvedValue(finishedProposal())
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', COAUTHOR)
        .send({ status: CoauthorStatus.APPROVED })
    })

    it('should refuse the change', () => {
      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should not touch the invitation', () => {
      expect(update).not.toHaveBeenCalled()
    })
  })

  describe('when the proposal does not exist', () => {
    beforeEach(async () => {
      ;(ProposalModel.findOne as jest.Mock).mockResolvedValue(undefined)
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', COAUTHOR)
        .send({ status: CoauthorStatus.APPROVED })
    })

    it('should respond with a 404', () => {
      expect(response.status).toBe(404)
    })

    it('should not touch any invitation', () => {
      expect(update).not.toHaveBeenCalled()
    })
  })

  describe('when the requested status is not a coauthor status', () => {
    beforeEach(async () => {
      response = await supertest(app)
        .put(`/api/coauthors/${PROPOSAL_ID}`)
        .set('x-test-auth', COAUTHOR)
        .send({ status: 'WHATEVER' })
    })

    it('should reject the request', () => {
      expect(response.status).toBe(400)
    })

    it('should not touch the invitation', () => {
      expect(update).not.toHaveBeenCalled()
    })
  })
})

describe('GET /api/coauthors/proposals/:address/:status?', () => {
  let app: Express
  let findProposals: jest.SpyInstance
  let response: supertest.Response

  beforeEach(() => {
    app = createTestApp(coauthor)
    findProposals = jest.spyOn(CoauthorModel, 'findProposals').mockResolvedValue([])
    jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(openProposal() as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the address is not an ethereum address', () => {
    beforeEach(async () => {
      response = await supertest(app).get('/api/coauthors/proposals/not-an-address')
    })

    it('should respond with a 400', () => {
      expect(response.status).toBe(400)
    })

    it('should not run the query', () => {
      expect(findProposals).not.toHaveBeenCalled()
    })
  })

  describe('when a status is given', () => {
    beforeEach(async () => {
      await supertest(app).get(`/api/coauthors/proposals/${COAUTHOR}/${CoauthorStatus.APPROVED}`)
    })

    it('should pass it through to the query', () => {
      expect(findProposals).toHaveBeenCalledWith(COAUTHOR, CoauthorStatus.APPROVED)
    })
  })

  describe('when no status is given', () => {
    beforeEach(async () => {
      await supertest(app).get(`/api/coauthors/proposals/${COAUTHOR}`)
    })

    it('should query without one', () => {
      expect(findProposals).toHaveBeenCalledWith(COAUTHOR, undefined)
    })
  })

  // A pending invitation on a proposal that has already finished can no longer be answered, so it
  // is filtered out of what the caller is shown.
  describe('when a pending invitation belongs to a finished proposal', () => {
    beforeEach(async () => {
      findProposals.mockResolvedValue([
        { proposal_id: PROPOSAL_ID, address: COAUTHOR.toLowerCase(), status: CoauthorStatus.PENDING },
      ])
      ;(ProposalModel.findOne as jest.Mock).mockResolvedValue(finishedProposal())
      response = await supertest(app).get(`/api/coauthors/proposals/${COAUTHOR}`)
    })

    it('should leave it out of the response', () => {
      expect(response.body.data).toEqual([])
    })
  })

  describe('when a pending invitation belongs to a proposal still open', () => {
    beforeEach(async () => {
      findProposals.mockResolvedValue([
        { proposal_id: PROPOSAL_ID, address: COAUTHOR.toLowerCase(), status: CoauthorStatus.PENDING },
      ])
      response = await supertest(app).get(`/api/coauthors/proposals/${COAUTHOR}`)
    })

    it('should include it', () => {
      expect(response.body.data).toHaveLength(1)
    })
  })

  describe('when an answered invitation belongs to a finished proposal', () => {
    beforeEach(async () => {
      findProposals.mockResolvedValue([
        { proposal_id: PROPOSAL_ID, address: COAUTHOR.toLowerCase(), status: CoauthorStatus.APPROVED },
      ])
      ;(ProposalModel.findOne as jest.Mock).mockResolvedValue(finishedProposal())
      response = await supertest(app).get(`/api/coauthors/proposals/${COAUTHOR}`)
    })

    it('should still include it, since it needs no further action', () => {
      expect(response.body.data).toHaveLength(1)
    })
  })
})
