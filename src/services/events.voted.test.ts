import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import ProposalModel from '../entities/Proposal/model'
import EventModel from '../models/Event'

import { ErrorService } from './ErrorService'
import { SnapshotService } from './SnapshotService'
import { EventsService } from './events'
import { NotificationService } from './notification'

const PROPOSAL_ID = '6a9d2bd4-3c2e-4e6c-9c37-1f2e9f0d1a11'
const VOTER = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'

const PROPOSAL_ROW = {
  id: PROPOSAL_ID,
  title: 'A proposal',
  snapshot_id: 'snapshot-proposal',
  snapshot_proposal: JSON.stringify({ choices: ['yes', 'no'] }),
}

describe('EventsService.voted', () => {
  let report: jest.SpyInstance
  let createEvent: jest.SpyInstance

  beforeEach(() => {
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    createEvent = jest.spyOn(EventModel, 'create').mockImplementation(async (event) => event as never)
    jest.spyOn(NotificationService, 'newVote').mockImplementation(async () => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the proposal does not exist', () => {
    let error: unknown

    beforeEach(async () => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(null as never)
      error = await EventsService.voted(PROPOSAL_ID, 'yes', VOTER).catch((caught) => caught)
    })

    it('should refuse with a 404', () => {
      expect(error).toBeInstanceOf(RequestError)
      expect((error as RequestError).statusCode).toBe(RequestError.NotFound)
    })

    it('should not report it as an error', () => {
      expect(report).not.toHaveBeenCalled()
    })
  })

  // Votes are checked against Snapshot so a "voted" entry cannot be made up.
  describe('when Snapshot has no vote from the caller on the proposal', () => {
    let error: unknown

    beforeEach(async () => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(PROPOSAL_ROW as never)
      jest.spyOn(SnapshotService, 'getVotesByProposal').mockResolvedValue([])
      error = await EventsService.voted(PROPOSAL_ID, 'yes', VOTER).catch((caught) => caught)
    })

    it('should refuse with a 403', () => {
      expect(error).toBeInstanceOf(RequestError)
      expect((error as RequestError).statusCode).toBe(RequestError.Forbidden)
    })

    it('should not record an event', () => {
      expect(createEvent).not.toHaveBeenCalled()
    })

    it('should not report it as an error', () => {
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when the caller voted on the proposal', () => {
    beforeEach(async () => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(PROPOSAL_ROW as never)
      jest
        .spyOn(SnapshotService, 'getVotesByProposal')
        .mockResolvedValue([{ voter: VOTER.toLowerCase(), choice: 2 }] as never)
      await EventsService.voted(PROPOSAL_ID, 'yes', VOTER)
    })

    it('should record the choice Snapshot has, not the one the client sent', () => {
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event_data: expect.objectContaining({ proposal_id: PROPOSAL_ID, choice: 'no' }) })
      )
    })
  })

  // Snapshot being down is a fault on our side, not the caller's.
  describe('when Snapshot cannot be reached', () => {
    const failure = new Error('Snapshot GraphQL request failed with status 503')
    let outcome: Promise<unknown>

    beforeEach(() => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(PROPOSAL_ROW as never)
      jest.spyOn(SnapshotService, 'getVotesByProposal').mockRejectedValue(failure)
      outcome = EventsService.voted(PROPOSAL_ID, 'yes', VOTER)
    })

    it('should still not fail the request', async () => {
      await expect(outcome).resolves.toBeUndefined()
    })

    it('should report it', async () => {
      await outcome
      expect(report).toHaveBeenCalledWith('Error creating event', expect.objectContaining({ error: failure }))
    })
  })

  describe('when the database fails', () => {
    const failure = new Error('connection terminated unexpectedly')
    let outcome: Promise<unknown>

    beforeEach(() => {
      jest.spyOn(ProposalModel, 'findOne').mockRejectedValue(failure)
      outcome = EventsService.voted(PROPOSAL_ID, 'yes', VOTER)
    })

    it('should still not fail the request', async () => {
      await expect(outcome).resolves.toBeUndefined()
    })

    it('should report it', async () => {
      await outcome
      expect(report).toHaveBeenCalledWith(
        'Error creating event',
        expect.objectContaining({ error: failure, proposal_id: PROPOSAL_ID, address: VOTER })
      )
    })
  })
})
