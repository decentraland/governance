/* eslint-disable @typescript-eslint/no-empty-function */
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { cloneDeep } from 'lodash'

import { NotificationService } from '../../back/services/notification'
import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { DiscourseService } from '../../services/DiscourseService'
import Time from '../../utils/date/Time'
import CoauthorModel from '../Coauthor/model'
import { NewGrantCategory } from '../Grant/types'
import { getQuarterEndDate } from '../QuarterBudget/utils'

import { finishProposal, getFinishableLinkedProposals } from './jobs'
import ProposalModel from './model'
import * as calculateOutcome from './outcome'
import {
  ACCEPTED_OUTCOME,
  FINISHED_OUTCOME,
  GRANT_1_SIZE,
  GRANT_2_SIZE,
  GRANT_3_SIZE,
  GRANT_PROPOSAL_1,
  GRANT_PROPOSAL_2,
  GRANT_PROPOSAL_3,
  POI_PROPOSAL,
  REJECTED_OUTCOME,
  createTestBid,
  createTestProposal,
  createTestTender,
  getTestBudgetWithAvailableSize,
} from './testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

jest.mock('decentraland-server')
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    end: jest.fn(),
    release: jest.fn(),
  }
  const mPool = {
    connect: jest.fn(() => mClient),
  }
  const mPG = {
    Pool: jest.fn(() => mPool),
  }
  return mPG
})

jest.mock('../../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
  NOTIFICATIONS_SERVICE_ENABLED: false,
}))

describe('finishProposals', () => {
  beforeAll(() => {
    jest.spyOn(logger, 'error').mockImplementation(() => {})
    jest.spyOn(ProposalModel, 'getFinishProposalQuery')
    jest.spyOn(ProposalModel, 'findByIds').mockResolvedValue([])
    jest.spyOn(CoauthorModel, 'findAllByProposals').mockResolvedValue([])
    jest.spyOn(DiscourseService, 'commentUpdatedProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'init').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'finishProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newUpdate').mockImplementation(() => {})
    jest.spyOn(NotificationService, 'votingEndedAuthors').mockImplementation()
    jest.spyOn(DiscourseService, 'getCategory').mockImplementation(() => 5)
  })
  beforeEach(() => {
    jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([getTestBudgetWithAvailableSize()])
    jest.spyOn(BudgetService, 'getBudgetUpdateQueries').mockReturnValue([])
  })
  describe('for a grant proposal with ACTIVE status', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1])
    })
    describe('when the outcome is REJECTED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(REJECTED_OUTCOME)
      })
      it('finishes the proposal as rejected', async () => {
        await finishProposal()
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id],
          ProposalStatus.Rejected
        )
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          ProposalStatus.Rejected,
          undefined
        )
      })
    })
    describe('when the outcome is ACCEPTED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(ACCEPTED_OUTCOME)
      })
      it('finishes the proposal as passed, and creates the pending updates for them', async () => {
        await finishProposal()
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          ProposalStatus.Passed,
          undefined
        )
      })

      describe('when the budget is greater than the requested grant size', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + 1
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgetsForProposals')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })
        it('discounts the grant funding size from the corresponding category budget', async () => {
          const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
          EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
          EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
          EXPECTED_BUDGET.allocated += GRANT_1_SIZE
          await finishProposal()
          expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([EXPECTED_BUDGET])
        })
        it('marks the proposal as PASSED', () => {
          expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
            [GRANT_PROPOSAL_1.id],
            ProposalStatus.Passed
          )
        })
      })

      describe('when the available budget is equal to the requested grant size', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgetsForProposals')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })

        it('discounts the grant size from the corresponding category budget', async () => {
          const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
          EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
          EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
          EXPECTED_BUDGET.allocated += GRANT_1_SIZE
          await finishProposal()
          expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([EXPECTED_BUDGET])
        })
        it('marks the proposal as PASSED', () => {
          expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
            [GRANT_PROPOSAL_1.id],
            ProposalStatus.Passed
          )
        })
      })

      describe('when there is not enough budget to fund the grant', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE - 1
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgetsForProposals')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })
        it('does not discount the grant funding from the corresponding category budget', async () => {
          await finishProposal()
          expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([
            getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR),
          ])
        })
        it('marks the proposal as OUT OF BUDGET', () => {
          expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
            [GRANT_PROPOSAL_1.id],
            ProposalStatus.OutOfBudget
          )
        })
      })
    })

    describe('when the outcome is FINISHED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(FINISHED_OUTCOME)
      })
      it('finishes the proposal as passed, and creates the pending updates for them', async () => {
        await finishProposal()
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id],
          ProposalStatus.Finished
        )
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          ProposalStatus.Finished,
          FINISHED_OUTCOME.winnerChoice
        )
      })
    })
  })

  describe('for an accepted proposal that is not a grant', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([POI_PROPOSAL])
      jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([getTestBudgetWithAvailableSize()])
    })
    it('finishes the proposal without affecting the budget', async () => {
      await finishProposal()
      expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith([POI_PROPOSAL.id], ProposalStatus.Passed)
      expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([getTestBudgetWithAvailableSize()])
    })
  })

  describe('for several grant proposals of the same category', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_2])
      jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is budget to fund all grants', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + GRANT_2_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('discounts the budget of the corresponding categories', async () => {
        await finishProposal()
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id, GRANT_PROPOSAL_2.id],
          ProposalStatus.Passed
        )
        expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([getTestBudgetWithAvailableSize(0)])
      })
    })

    describe('if there are not enough funds to accept all grants', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + GRANT_2_SIZE - 1
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('the latest grants in the list are updated as OUT OF BUDGET', async () => {
        await finishProposal()
        const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
        EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
        EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
        EXPECTED_BUDGET.allocated += GRANT_1_SIZE
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_2.id],
          ProposalStatus.OutOfBudget
        )
        expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([EXPECTED_BUDGET])
      })
    })

    describe('when there is not enough budget to fund a grant that was created first, but there is remaining budget for a smaller grant', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_2_SIZE + 1
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('marks the first grant as OOB and passes the second grant, discounting only the second grant size from the budget', async () => {
        await finishProposal()
        const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
        EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_2_SIZE
        EXPECTED_BUDGET.categories.accelerator.available -= GRANT_2_SIZE
        EXPECTED_BUDGET.allocated += GRANT_2_SIZE
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id],
          ProposalStatus.OutOfBudget
        )
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith([GRANT_PROPOSAL_2.id], ProposalStatus.Passed)
        expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([EXPECTED_BUDGET])
      })
    })
  })

  describe('for several grant proposals of different categories', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_3])
      jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is no category budget to fund one grant, but there is for another', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE - 1
      const AVAILABLE_FOR_CORE_UNIT = GRANT_3_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR, AVAILABLE_FOR_CORE_UNIT)])
      })
      it('discounts the budget of the corresponding categories', async () => {
        await finishProposal()
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith([GRANT_PROPOSAL_3.id], ProposalStatus.Passed)
        expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id],
          ProposalStatus.OutOfBudget
        )
        expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([
          getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR, 0),
        ])
      })
    })
  })

  describe('when proposals creation dates correspond to two different budgets', () => {
    const DATE_1 = Time.utc('2023-04-01 00:00:00Z').toDate()
    const DATE_2 = Time.utc('2023-07-01 00:00:00Z').toDate()
    const PROPOSAL_OF_DATE_1 = cloneDeep(GRANT_PROPOSAL_1)
    PROPOSAL_OF_DATE_1.start_at = DATE_1
    const PROPOSAL_OF_DATE_2 = cloneDeep(GRANT_PROPOSAL_2)
    PROPOSAL_OF_DATE_2.start_at = DATE_2

    const BUDGET_1 = getTestBudgetWithAvailableSize(GRANT_1_SIZE)
    BUDGET_1.start_at = DATE_1
    BUDGET_1.finish_at = getQuarterEndDate(DATE_1)
    BUDGET_1.id = 'DATE_1_BUDGET'

    const BUDGET_2 = getTestBudgetWithAvailableSize(GRANT_2_SIZE)
    BUDGET_2.start_at = DATE_2
    BUDGET_2.finish_at = getQuarterEndDate(DATE_2)
    BUDGET_2.id = 'DATE_2_BUDGET'

    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([PROPOSAL_OF_DATE_1, PROPOSAL_OF_DATE_2])
      jest.spyOn(calculateOutcome, 'calculateVotingResult').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([BUDGET_1, BUDGET_2])
    })

    it('discounts each grant size for the corresponding budget', async () => {
      const EXPECTED_BUDGET_1 = cloneDeep(BUDGET_1)
      EXPECTED_BUDGET_1.categories.accelerator.allocated += GRANT_1_SIZE
      EXPECTED_BUDGET_1.categories.accelerator.available -= GRANT_1_SIZE
      EXPECTED_BUDGET_1.allocated += GRANT_1_SIZE

      const EXPECTED_BUDGET_2 = cloneDeep(BUDGET_2)
      EXPECTED_BUDGET_2.categories.accelerator.allocated += GRANT_2_SIZE
      EXPECTED_BUDGET_2.categories.accelerator.available -= GRANT_2_SIZE
      EXPECTED_BUDGET_2.allocated += GRANT_2_SIZE

      await finishProposal()

      expect(ProposalModel.getFinishProposalQuery).toHaveBeenCalledWith(
        [PROPOSAL_OF_DATE_1.id, PROPOSAL_OF_DATE_2.id],
        ProposalStatus.Passed
      )
      expect(BudgetService.getBudgetUpdateQueries).toHaveBeenCalledWith([EXPECTED_BUDGET_1, EXPECTED_BUDGET_2])
    })
  })
})

describe('getFinishabledLinkedProposals', () => {
  const pendingProposals: ProposalAttributes<any>[] = [
    createTestTender('1', '123'),
    createTestTender('2', '123'),
    createTestTender('3', '123'),
    createTestTender('4', '456'),
    createTestTender('7', '789'),
    createTestBid('8', '1231'),
    createTestBid('9', '1231'),
    createTestProposal(ProposalType.Grant, ProposalStatus.Active, 200, NewGrantCategory.Accelerator),
  ]

  const proposalsList: ProposalAttributes<any>[] = [
    ...pendingProposals,
    createTestTender('5', '456'),
    createTestTender('6', '456'),
    createTestTender('8', '789'),
    createTestBid('10', '1231'),
    createTestBid('11', '1231'),
  ]

  it('does not return duplicate proposals to tender type proposals', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ProposalModel, 'getProposalList').mockImplementation((filter: any) => {
      return proposalsList.filter((p) => {
        return p.configuration.linked_proposal_id === filter.linkedProposalId && p.type === ProposalType.Tender
      })
    })

    const finishableTenderProposals = await getFinishableLinkedProposals(pendingProposals, ProposalType.Tender)
    expect(finishableTenderProposals.length).toEqual(8)
  })

  it('does not return duplicate proposals to bid type proposals', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ProposalModel, 'getProposalList').mockImplementation((filter: any) => {
      return proposalsList.filter((p) => {
        return p.configuration.linked_proposal_id === filter.linkedProposalId && p.type === ProposalType.Bid
      })
    })

    const finishableBidProposals = await getFinishableLinkedProposals(pendingProposals, ProposalType.Bid)
    expect(finishableBidProposals.length).toEqual(4)
  })
})
