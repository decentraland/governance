/* eslint-disable @typescript-eslint/no-empty-function */
import { DiscordService } from '../../services/DiscordService'
import UpdateModel from '../Updates/model'

import * as calculateOutcome from './calculateOutcome'
import { ProposalOutcome } from './calculateOutcome'
import { finishProposal } from './jobs'
import ProposalModel from './model'
import * as routes from './routes'
import { JOB_CONTEXT_MOCK, createTestProposal } from './test_helpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

const REJECTED_OUTCOME = {
  winnerChoice: DEFAULT_CHOICES[1],
  outcomeStatus: ProposalOutcome.REJECTED,
}
const ACCEPTED_OUTCOME = {
  winnerChoice: DEFAULT_CHOICES[0],
  outcomeStatus: ProposalOutcome.ACCEPTED,
}

const FINISHED_OUTCOME = {
  winnerChoice: DEFAULT_CHOICES[0],
  outcomeStatus: ProposalOutcome.FINISHED,
}

const GRANT_PROPOSAL: ProposalAttributes = createTestProposal(ProposalType.Grant, ProposalStatus.Active)

jest.mock('../../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
}))

describe('finishProposals', () => {
  const updatesSpy = jest.spyOn(UpdateModel, 'createPendingUpdates')
  beforeAll(() => {
    jest.spyOn(ProposalModel, 'finishProposal')
    jest.spyOn(routes, 'commentProposalUpdateInDiscourse').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'init').mockImplementation(() => {})
    updatesSpy.mockResolvedValue([])
    jest.spyOn(DiscordService, 'finishProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newUpdate').mockImplementation(() => {})
  })
  beforeEach(() => {
    updatesSpy.mockClear()
  })
  describe('for a grant proposal with ACTIVE status', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([GRANT_PROPOSAL])
    })
    describe('when the outcome is REJECTED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(REJECTED_OUTCOME)
      })
      it('finishes the proposal as rejected', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL.id], ProposalStatus.Rejected)
        expect(UpdateModel.createPendingUpdates).toHaveBeenCalledTimes(0)
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL.id,
          GRANT_PROPOSAL.title,
          REJECTED_OUTCOME.outcomeStatus,
          undefined
        )
      })
      describe('when the outcome is ACCEPTED', () => {
        beforeEach(() => {
          jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
        })
        it('finishes the proposal as passed, and creates the pending updates for them', async () => {
          await finishProposal(JOB_CONTEXT_MOCK)
          expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL.id], ProposalStatus.Passed)
          expect(UpdateModel.createPendingUpdates).toHaveBeenCalledWith(
            GRANT_PROPOSAL.id,
            GRANT_PROPOSAL.configuration.projectDuration
          )
          expect(DiscordService.finishProposal).toHaveBeenCalledWith(
            GRANT_PROPOSAL.id,
            GRANT_PROPOSAL.title,
            ACCEPTED_OUTCOME.outcomeStatus,
            undefined
          )
        })

        // describe('when there is enough budget to fund the grant', () => {
        //
        // })
        // describe('when there is not enough budget to fund the grant', () => {
        //
        // })
      })
      describe('when the outcome is FINISHED', () => {
        beforeEach(() => {
          jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(FINISHED_OUTCOME)
        })
        it('finishes the proposal as passed, and creates the pending updates for them', async () => {
          await finishProposal(JOB_CONTEXT_MOCK)
          expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL.id], ProposalStatus.Finished)
          expect(UpdateModel.createPendingUpdates).toHaveBeenCalledTimes(0)
          expect(DiscordService.finishProposal).toHaveBeenCalledWith(
            GRANT_PROPOSAL.id,
            GRANT_PROPOSAL.title,
            FINISHED_OUTCOME.outcomeStatus,
            FINISHED_OUTCOME.winnerChoice
          )
        })
      })
    })
  })
  // describe('for two grant proposals of the same category', () => {})
})
