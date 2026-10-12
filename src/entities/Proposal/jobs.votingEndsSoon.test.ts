import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { SnapshotProposalTally } from '../../clients/SnapshotTypes'
import { ErrorService } from '../../services/ErrorService'
import { DiscordService } from '../../services/discord'

import { VOTING_ENDS_SOON_MIN_REMAINING, VOTING_ENDS_SOON_WINDOW } from './constants'
import { notifyVotingEndsSoon } from './jobs'
import ProposalModel from './model'
import { createTestProposal } from './testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

jest.mock('../../constants', () => ({
  ...jest.requireActual('../../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

jest.mock('decentraland-server')
jest.mock('@pushprotocol/restapi/src/index.js', () => jest.fn())

// The job reads the flag when it runs, so flipping it on the mocked module is enough.
const constants = jest.requireMock('../../constants') as { DISCORD_SERVICE_ENABLED: boolean }

const TALLY: SnapshotProposalTally = { scores: [10, 5], scores_total: 15, votes: 3 }

function createContext() {
  return { log: jest.fn() } as unknown as JobContext
}

function createProposal(): ProposalAttributes {
  return createTestProposal(ProposalType.Poll, ProposalStatus.Active)
}

describe('notifyVotingEndsSoon', () => {
  let claim: jest.SpyInstance
  let release: jest.SpyInstance
  let votingEndsSoon: jest.SpyInstance
  let getProposalTally: jest.Mock
  let report: jest.SpyInstance

  beforeEach(() => {
    constants.DISCORD_SERVICE_ENABLED = true
    claim = jest.spyOn(ProposalModel, 'claimVotingEndsSoonReminders').mockResolvedValue([])
    release = jest.spyOn(ProposalModel, 'releaseVotingEndsSoonReminder').mockResolvedValue(1)
    votingEndsSoon = jest.spyOn(DiscordService, 'votingEndsSoon').mockResolvedValue(undefined)
    getProposalTally = jest.fn().mockResolvedValue(TALLY)
    jest.spyOn(SnapshotGraphql, 'get').mockReturnValue({ getProposalTally } as unknown as SnapshotGraphql)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // A claim taken while nothing can be posted would use up the reminder for good.
  describe('when discord is disabled', () => {
    beforeEach(async () => {
      constants.DISCORD_SERVICE_ENABLED = false
      await notifyVotingEndsSoon(createContext())
    })

    it('should not claim any proposal', () => {
      expect(claim).not.toHaveBeenCalled()
    })
  })

  describe('when no proposal is closing soon', () => {
    beforeEach(async () => {
      await notifyVotingEndsSoon(createContext())
    })

    it('should claim with the reminder window and minimum remaining time', () => {
      expect(claim).toHaveBeenCalledWith(VOTING_ENDS_SOON_WINDOW, VOTING_ENDS_SOON_MIN_REMAINING)
    })

    it('should post nothing', () => {
      expect(votingEndsSoon).not.toHaveBeenCalled()
    })
  })

  describe('when proposals are claimed', () => {
    let first: ProposalAttributes
    let second: ProposalAttributes
    let context: JobContext

    beforeEach(async () => {
      first = createProposal()
      second = createProposal()
      claim.mockResolvedValue([first, second])
      context = createContext()
      await notifyVotingEndsSoon(context)
    })

    it('should read the tally of each from snapshot', () => {
      expect(getProposalTally.mock.calls).toEqual([[first.snapshot_id], [second.snapshot_id]])
    })

    it('should post a reminder for each with its tally', () => {
      expect(votingEndsSoon.mock.calls).toEqual([
        [first, TALLY],
        [second, TALLY],
      ])
    })

    it('should hand nothing back', () => {
      expect(release).not.toHaveBeenCalled()
    })

    it('should log how many were reminded', () => {
      expect(context.log).toHaveBeenCalledWith('Reminded 2 proposals that voting ends soon...')
    })
  })

  describe('when the tally cannot be read', () => {
    let proposal: ProposalAttributes

    beforeEach(async () => {
      proposal = createProposal()
      claim.mockResolvedValue([proposal])
      getProposalTally.mockRejectedValue(new Error('snapshot is down'))
      await notifyVotingEndsSoon(createContext())
    })

    it('should still post the reminder, without the tally', () => {
      expect(votingEndsSoon).toHaveBeenCalledWith(proposal, undefined)
    })

    it('should keep the claim', () => {
      expect(release).not.toHaveBeenCalled()
    })
  })

  describe('when posting one of the reminders fails', () => {
    let failing: ProposalAttributes
    let succeeding: ProposalAttributes
    let context: JobContext

    beforeEach(async () => {
      failing = createProposal()
      succeeding = createProposal()
      claim.mockResolvedValue([failing, succeeding])
      votingEndsSoon.mockRejectedValueOnce(new Error('Missing Access'))
      context = createContext()
      await notifyVotingEndsSoon(context)
    })

    it('should hand that one back so the next run retries it', () => {
      expect(release).toHaveBeenCalledWith(failing.id)
    })

    it('should hand back only that one', () => {
      expect(release).toHaveBeenCalledTimes(1)
    })

    it('should still post the rest', () => {
      expect(votingEndsSoon).toHaveBeenCalledWith(succeeding, TALLY)
    })

    it('should report the failure', () => {
      expect(report).toHaveBeenCalledWith(
        'Error sending voting ends soon reminder to Discord',
        expect.objectContaining({ proposalId: failing.id })
      )
    })

    it('should count only the reminders that went out', () => {
      expect(context.log).toHaveBeenCalledWith('Reminded 1 proposals that voting ends soon...')
    })
  })

  describe('when handing a failed reminder back fails as well', () => {
    let failing: ProposalAttributes
    let succeeding: ProposalAttributes

    beforeEach(async () => {
      failing = createProposal()
      succeeding = createProposal()
      claim.mockResolvedValue([failing, succeeding])
      votingEndsSoon.mockRejectedValueOnce(new Error('Missing Access'))
      release.mockRejectedValueOnce(new Error('connection reset'))
      await notifyVotingEndsSoon(createContext())
    })

    it('should report it', () => {
      expect(report).toHaveBeenCalledWith(
        'Error releasing voting ends soon reminder',
        expect.objectContaining({ proposalId: failing.id })
      )
    })

    it('should still post the rest', () => {
      expect(votingEndsSoon).toHaveBeenCalledWith(succeeding, TALLY)
    })
  })

  describe('when claiming fails', () => {
    let claimError: Error

    beforeEach(async () => {
      claimError = new Error('connection refused')
      claim.mockRejectedValue(claimError)
      await notifyVotingEndsSoon(createContext())
    })

    it('should report the failure instead of throwing', () => {
      expect(report).toHaveBeenCalledWith(
        'Error notifying voting ends soon',
        expect.objectContaining({ error: claimError })
      )
    })
  })
})
