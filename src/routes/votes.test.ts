import { Server } from 'http'
import supertest from 'supertest'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import VotesModel from '../entities/Votes/model'
import { ProposalService } from '../services/ProposalService'
import { SnapshotService } from '../services/SnapshotService'
import { VoteService } from '../services/vote'

import { createTestApp } from './testApp'
import votes from './votes'

const ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const PROPOSAL_ID = '00000000-0000-0000-0000-000000000001'
const SNAPSHOT_ID = 'snapshot-1'

function storedProposal(finishAt: Date) {
  return {
    ...createTestProposal(ProposalType.Poll, ProposalStatus.Active),
    id: PROPOSAL_ID,
    snapshot_id: SNAPSHOT_ID,
    finish_at: finishAt,
  }
}

const STILL_OPEN = new Date(Date.now() + 24 * 60 * 60 * 1000)
const LONG_FINISHED = new Date('2020-01-01T00:00:00.000Z')

describe('the vote routes', () => {
  let app: Server

  beforeEach(() => {
    app = createTestApp(votes)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/proposals/:proposal/votes', () => {
    let getVotesByProposal: jest.SpyInstance
    let update: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      jest.spyOn(ProposalService, 'getProposal').mockResolvedValue(storedProposal(STILL_OPEN) as never)
      jest.spyOn(VoteService, 'getVotes').mockResolvedValue({ hash: 'stored-hash', votes: { stored: true } } as never)
      getVotesByProposal = jest.fn().mockResolvedValue([])
      jest.spyOn(SnapshotGraphql, 'get').mockReturnValue({ getVotesByProposal } as never)
      jest.spyOn(VotesModel, 'hashVotes').mockReturnValue('stored-hash')
      update = jest.spyOn(VotesModel, 'update').mockResolvedValue({} as never)
    })

    describe('when the proposal id is not a uuid', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/proposals/not-a-uuid/votes')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })
    })

    // Voting is closed and settled, so there is nothing new to fetch.
    describe('when the proposal finished more than an hour ago', () => {
      beforeEach(async () => {
        ;(ProposalService.getProposal as jest.Mock).mockResolvedValue(storedProposal(LONG_FINISHED))
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/votes`)
      })

      it('should serve the stored votes', () => {
        expect(response.body.data).toEqual({ stored: true })
      })

      it('should not ask snapshot at all', () => {
        expect(getVotesByProposal).not.toHaveBeenCalled()
      })
    })

    describe('when a finished proposal is asked to refresh', () => {
      beforeEach(async () => {
        ;(ProposalService.getProposal as jest.Mock).mockResolvedValue(storedProposal(LONG_FINISHED))
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/votes?refresh=true`)
      })

      it('should go back to snapshot anyway', () => {
        expect(getVotesByProposal).toHaveBeenCalledWith(SNAPSHOT_ID)
      })
    })

    describe('when snapshot returns the same votes already stored', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/votes`)
      })

      it('should serve the stored votes', () => {
        expect(response.body.data).toEqual({ stored: true })
      })

      it('should not rewrite an unchanged row', () => {
        expect(update).not.toHaveBeenCalled()
      })
    })

    describe('when snapshot returns votes that differ from the stored ones', () => {
      beforeEach(async () => {
        ;(VotesModel.hashVotes as jest.Mock).mockReturnValue('a-different-hash')
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/votes`)
      })

      it('should store the new votes against the proposal', () => {
        expect(update).toHaveBeenCalledWith(expect.anything(), { proposal_id: PROPOSAL_ID })
      })
    })

    // Snapshot being unreachable must not take the votes endpoint down with it.
    describe('when snapshot is unreachable', () => {
      beforeEach(async () => {
        getVotesByProposal.mockRejectedValue(new Error('snapshot down'))
        response = await supertest(app).get(`/api/proposals/${PROPOSAL_ID}/votes`)
      })

      it('should respond with a 200', () => {
        expect(response.status).toBe(200)
      })

      it('should fall back to the stored votes', () => {
        expect(response.body.data).toEqual({ stored: true })
      })
    })
  })

  describe('GET /api/votes', () => {
    let findAny: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      findAny = jest.spyOn(VotesModel, 'findAny').mockResolvedValue([
        { proposal_id: 'first', votes: { a: 1 } },
        { proposal_id: 'second', votes: { b: 2 } },
      ] as never)
    })

    describe('when no proposal ids are given', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/votes')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not run the query', () => {
        expect(findAny).not.toHaveBeenCalled()
      })
    })

    describe('when proposal ids are given', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/votes?id=first&id=second')
      })

      it('should key the result by proposal id', () => {
        expect(response.body.data).toEqual({ first: { a: 1 }, second: { b: 2 } })
      })
    })
  })

  describe('GET /api/votes/:address', () => {
    let getVotesByAddresses: jest.SpyInstance
    let response: supertest.Response

    beforeEach(() => {
      getVotesByAddresses = jest.spyOn(SnapshotService, 'getVotesByAddresses').mockResolvedValue([] as never)
      jest.spyOn(ProposalModel, 'findFromSnapshotIds').mockResolvedValue([] as never)
    })

    describe('when the address is not an ethereum address', () => {
      beforeEach(async () => {
        response = await supertest(app).get('/api/votes/not-an-address')
      })

      it('should respond with a 400', () => {
        expect(response.status).toBe(400)
      })

      it('should not query snapshot', () => {
        expect(getVotesByAddresses).not.toHaveBeenCalled()
      })
    })

    describe('when paging arguments are whole numbers', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/votes/${ADDRESS}?first=10&skip=5`)
      })

      it('should pass them through', () => {
        expect(getVotesByAddresses).toHaveBeenCalledWith([ADDRESS], 10, 5)
      })
    })

    describe('when paging arguments are not whole numbers', () => {
      beforeEach(async () => {
        await supertest(app).get(`/api/votes/${ADDRESS}?first=abc&skip=1.5`)
      })

      it('should drop them rather than forward a NaN', () => {
        expect(getVotesByAddresses).toHaveBeenCalledWith([ADDRESS], undefined, undefined)
      })
    })

    describe('when the address has no votes', () => {
      beforeEach(async () => {
        response = await supertest(app).get(`/api/votes/${ADDRESS}`)
      })

      it('should return an empty list', () => {
        expect(response.body.data).toEqual([])
      })
    })

    describe('when a vote has no matching stored proposal', () => {
      beforeEach(async () => {
        getVotesByAddresses.mockResolvedValue([
          { created: 2, proposal: { id: 'known' } },
          { created: 1, proposal: { id: 'unknown' } },
        ])
        ;(ProposalModel.findFromSnapshotIds as jest.Mock).mockResolvedValue([
          { ...createTestProposal(ProposalType.Poll, ProposalStatus.Active), snapshot_id: 'known', id: PROPOSAL_ID },
        ])
        response = await supertest(app).get(`/api/votes/${ADDRESS}`)
      })

      it('should drop the vote it cannot describe', () => {
        expect(response.body.data).toHaveLength(1)
      })

      it('should decorate the one it can with the stored proposal', () => {
        expect(response.body.data[0].proposal.proposal_id).toBe(PROPOSAL_ID)
      })
    })

    describe('when several votes match stored proposals', () => {
      beforeEach(async () => {
        getVotesByAddresses.mockResolvedValue([
          { created: 1, proposal: { id: 'older' } },
          { created: 3, proposal: { id: 'newer' } },
        ])
        ;(ProposalModel.findFromSnapshotIds as jest.Mock).mockResolvedValue([
          { ...createTestProposal(ProposalType.Poll, ProposalStatus.Active), snapshot_id: 'older' },
          { ...createTestProposal(ProposalType.Poll, ProposalStatus.Active), snapshot_id: 'newer' },
        ])
        response = await supertest(app).get(`/api/votes/${ADDRESS}`)
      })

      it('should return the most recent vote first', () => {
        expect(response.body.data.map((vote: { created: number }) => vote.created)).toEqual([3, 1])
      })
    })
  })

  describe('GET /api/votes/top-voters', () => {
    let getTopVoters: jest.SpyInstance

    beforeEach(() => {
      getTopVoters = jest.spyOn(VoteService, 'getTopVotersForLast30Days').mockResolvedValue([] as never)
    })

    describe('when no limit is given', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/votes/top-voters')
      })

      it('should query without one', () => {
        expect(getTopVoters).toHaveBeenCalledWith(undefined)
      })
    })

    describe('when a limit is given in the query string', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/votes/top-voters?limit=5')
      })

      it('should pass it through', () => {
        expect(getTopVoters).toHaveBeenCalledWith(5)
      })
    })

    describe('when the limit is not a positive whole number', () => {
      it('should ignore a non-numeric limit', async () => {
        await supertest(app).get('/api/votes/top-voters?limit=abc')
        expect(getTopVoters).toHaveBeenCalledWith(undefined)
      })

      it('should ignore a zero limit', async () => {
        await supertest(app).get('/api/votes/top-voters?limit=0')
        expect(getTopVoters).toHaveBeenCalledWith(undefined)
      })

      it('should ignore a negative limit', async () => {
        await supertest(app).get('/api/votes/top-voters?limit=-5')
        expect(getTopVoters).toHaveBeenCalledWith(undefined)
      })
    })
  })

  describe('GET /api/votes/participation', () => {
    let getParticipation: jest.SpyInstance

    beforeEach(() => {
      getParticipation = jest.spyOn(VoteService, 'getParticipation').mockResolvedValue({} as never)
    })

    describe('when it is requested', () => {
      beforeEach(async () => {
        await supertest(app).get('/api/votes/participation')
      })

      it('should be served without requiring authentication', () => {
        expect(getParticipation).toHaveBeenCalled()
      })
    })
  })
})
