/* eslint-disable @typescript-eslint/no-empty-function */
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { cloneDeep } from 'lodash'

import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import UpdateModel from '../Updates/model'

import * as calculateOutcome from './calculateOutcome'
import { ProposalOutcome } from './calculateOutcome'
import { finishProposal } from './jobs'
import ProposalModel from './model'
import * as routes from './routes'
import { JOB_CONTEXT_MOCK, createTestProposal } from './test_helpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES, asNumber } from './utils'

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

function getCurrentBudget() {
  return {
    categories: {
      accelerator: {
        allocated: 5105,
        available: 100000,
        total: 105105,
      },
      core_unit: {
        allocated: 225225,
        available: 0,
        total: 225225,
      },
      documentation: {
        allocated: 60000,
        available: -14955,
        total: 45045,
      },
      in_world_content: {
        allocated: 0,
        available: 300300,
        total: 300300,
      },
      platform: {
        allocated: 0,
        available: 600600,
        total: 600600,
      },
      social_media_content: {
        allocated: 0,
        available: 75075,
        total: 75075,
      },
      sponsorship: {
        allocated: 0,
        available: 150150,
        total: 150150,
      },
    },
    finish_at: Time.utc('2023-04-01T00:00:00.000Z').toJSON() as never,
    start_at: Time.utc('2023-01-01T00:00:00.000Z').toJSON() as never,
    total: 1501500,
    allocated: 290330,
    id: 'budget_id_1',
  }
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

        describe('when there is enough budget to fund the grant', () => {
          beforeEach(() => {
            jest.spyOn(BudgetService, 'getBudgets').mockResolvedValue([getCurrentBudget()])
            jest.spyOn(BudgetService, 'updateBudgets').mockImplementation(async () => {})
          })
          it('discounts the grant funding size from the corresponding category budget', async () => {
            const proposalSize = asNumber(GRANT_PROPOSAL.configuration.size)
            const CURRENT_BUDGET = getCurrentBudget()
            const EXPECTED_BUDGET = cloneDeep(CURRENT_BUDGET)
            EXPECTED_BUDGET.categories.accelerator.allocated =
              CURRENT_BUDGET.categories.accelerator.allocated + proposalSize
            EXPECTED_BUDGET.categories.accelerator.available =
              CURRENT_BUDGET.categories.accelerator.available - proposalSize
            EXPECTED_BUDGET.allocated = CURRENT_BUDGET.allocated + proposalSize
            await finishProposal(JOB_CONTEXT_MOCK)
            expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET])
          })
          it('marks the proposal as PASSED', () => {
            expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL.id], ProposalStatus.Passed)
          })
        })

        describe('when there is not enough budget to fund the grant', () => {
          it('does not discount the grant funding from the corresponding category budget', () => {
            fail()
          })
          it('marks the proposal as OUT OF BUDGET', () => {})
        })
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
  describe('for an accepted proposal that is not a grant', () => {
    it('does not affect the budget', () => {
      fail()
    })
  })
  describe('for several grant proposals of the same category', () => {
    it('discounts the budget of the corresponding categories', () => {
      fail()
    })

    describe('if there are not enough funds to accept all grants', () => {
      it('the latest grants in the list are updated as OUT OF BUDGET', () => {
        fail()
      })
    })
    describe('when there is not enough budget to fund a grant that was created first, but there is remaining budget for a smaller grant', () => {
      it('marks the grant that exceeds the budget as out of budget, and does not discount the size from the budget', () => {
        fail()
      })
      it('marks the proposal with the affordable budget as PASSED and updates the budget', () => {})
    })
  })

  describe('when proposals are for ended quarter budget and for new budget', () => {})
})
