import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import snakeCase from 'lodash/snakeCase'

import { Transparency, TransparencyBudget } from '../clients/Transparency'
import {
  Budget,
  BudgetWithContestants,
  CategoryBudget,
  CategoryBudgetWithContestants,
  ContestingGrantProposal,
  NULL_BUDGET,
  NULL_CATEGORY_BUDGET,
  NULL_CONTESTED_BUDGET,
} from '../entities/Budget/types'
import { BUDGETING_START_DATE } from '../entities/Grant/constants'
import { NewGrantCategory } from '../entities/Grant/types'
import { isValidGrantBudget } from '../entities/Grant/utils'
import ProposalModel from '../entities/Proposal/model'
import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import { QuarterBudgetAttributes } from '../entities/QuarterBudget/types'
import { toNewGrantCategory } from '../entities/QuarterCategoryBudget/utils'
import { getUncappedRoundedPercentage } from '../helpers'
import { ErrorCategory } from '../utils/errorCategories'
import logger from '../utils/logger'

import { ErrorService } from './ErrorService'
import { ProposalService } from './ProposalService'

export const TransparencyBudgetSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['start_date', 'total', 'category_percentages'],
  properties: {
    start_date: {
      type: 'string',
      minLength: 6,
      maxLength: 20,
    },
    total: {
      type: 'integer',
      minimum: 0,
    },
    category_percentages: {
      type: 'object',
      additionalProperties: false,
      required: [
        'accelerator',
        'core_unit',
        'documentation',
        'in_world_content',
        'platform',
        'social_media_content',
        'sponsorship',
      ],
      properties: {
        accelerator: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        core_unit: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        documentation: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        in_world_content: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        platform: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        social_media_content: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        sponsorship: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
      },
    },
  },
}
const transparencyBudgetValidator = schema.compile(TransparencyBudgetSchema)

export class BudgetService {
  public static async getTransparencyBudgets() {
    let budgets: TransparencyBudget[] = []
    try {
      budgets = await Transparency.getBudgets()
      if (!budgets || budgets.length < 1) {
        logger.error(`Received an empty list of transparency budgets`)
        return []
      }
      try {
        budgets.forEach((budget) => validate<TransparencyBudget>(transparencyBudgetValidator, budget))
      } catch (e) {
        logger.error(`Invalid transparency budgets ${JSON.stringify(budgets)}. ${JSON.stringify(e)}`)
        console.error(`Invalid transparency budgets ${JSON.stringify(budgets)}`, e)
        return []
      }
    } catch (e) {
      logger.error(`Unable to fetch transparency budgets. ${JSON.stringify(e)}`)
      console.error('Unable to fetch transparency budgets', e)
    }
    return budgets
  }

  public static async updateGovernanceBudgets(): Promise<QuarterBudgetAttributes[]> {
    const transparencyBudgets = await this.getTransparencyBudgets()
    return await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
  }

  static async getAllBudgets(): Promise<Budget[]> {
    const budgets = await QuarterBudgetModel.getAllBudgets()
    if (budgets.length === 0) {
      ErrorService.report('Could not find any budgets', { category: ErrorCategory.Budget })
    }
    return budgets
  }

  static async getCurrentBudget(): Promise<Budget> {
    const currentBudget = await QuarterBudgetModel.getCurrentBudget()
    if (currentBudget !== null) {
      return currentBudget
    }
    ErrorService.report('Could not find current budget', { category: ErrorCategory.Budget })
    return NULL_BUDGET
  }

  static async getCategoryBudget(category: NewGrantCategory): Promise<CategoryBudget> {
    const categoryBudget = await QuarterBudgetModel.getCategoryBudgetForCurrentQuarter(category)
    if (categoryBudget !== null) {
      const { total, allocated } = categoryBudget
      return { total, allocated, available: total - allocated }
    }
    ErrorService.report('Could not find category budget for current quarter', {
      budgetCategory: category,
      category: ErrorCategory.Budget,
    })
    return NULL_CATEGORY_BUDGET
  }

  static async validateGrantRequest(grantSize: number, grantCategory: NewGrantCategory | null) {
    if (!isValidGrantBudget(grantSize)) {
      throw new Error('Grant size is not valid for the selected tier')
    }
    const validGrantCategory = toNewGrantCategory(grantCategory)
    const currentCategoryBudget = await this.getCategoryBudget(validGrantCategory)

    if (grantSize > currentCategoryBudget.available) {
      throw new Error(
        `Not enough budget for requested grant size. Available: $${currentCategoryBudget.available}. Requested: $${grantSize}`
      )
    }
  }

  static getProposalsBudgetingMinAndMaxDates(proposals: Pick<ProposalAttributes, 'start_at'>[]): {
    minDate?: Date
    maxDate?: Date
  } {
    const sorted = proposals
      .filter((p) => p.start_at && p.start_at >= BUDGETING_START_DATE)
      .sort((p1, p2) => p1.start_at.getTime() - p2.start_at.getTime())
    return { minDate: sorted[0]?.start_at, maxDate: sorted[sorted.length - 1]?.start_at }
  }

  static async getBudgetsForProposals(proposals: Pick<ProposalAttributes, 'start_at' | 'type'>[]): Promise<Budget[]> {
    const grantProposals = proposals.filter((proposal) => proposal.type === ProposalType.Grant)
    const budgetsForProposals: Budget[] = []
    const { minDate, maxDate } = this.getProposalsBudgetingMinAndMaxDates(grantProposals)
    if (!minDate) return budgetsForProposals
    const oldestBudget = await QuarterBudgetModel.getBudgetForDate(minDate)
    if (oldestBudget === null) {
      ErrorService.report('Could not find budget for date', { date: minDate, category: ErrorCategory.Budget })
      return budgetsForProposals
    }
    budgetsForProposals.push(oldestBudget)
    if (maxDate && minDate !== maxDate) {
      const newestBudget = await QuarterBudgetModel.getBudgetForDate(maxDate)
      if (newestBudget !== null && newestBudget.id !== oldestBudget.id) {
        budgetsForProposals.push(newestBudget)
      }
    }
    return budgetsForProposals
  }

  static getBudgetUpdateQueries(budgets: Budget[]) {
    return budgets.flatMap((budget) => QuarterBudgetModel.getBudgetUpdateQuery(budget))
  }

  static async getCurrentContestedBudget() {
    const currentBudget = await this.getCurrentBudget()
    if (!currentBudget) {
      return NULL_CONTESTED_BUDGET
    }
    const activeGrantProposals = await ProposalModel.getActiveGrantProposals(
      currentBudget.start_at,
      currentBudget.finish_at
    )
    return this.createBudgetWithContestants(currentBudget, activeGrantProposals)
  }

  static async getBudgetWithContestants(proposalId: string) {
    const proposal = await ProposalService.getProposal(proposalId)
    if (proposal.type !== ProposalType.Grant) {
      return NULL_CONTESTED_BUDGET
    }
    const proposalBudget = await QuarterBudgetModel.getBudgetForDate(proposal.created_at)
    if (!proposalBudget) {
      return NULL_CONTESTED_BUDGET
    }
    const contestingProposals = await ProposalModel.getActiveGrantProposals(
      proposalBudget.start_at,
      proposalBudget.finish_at
    )
    return this.createBudgetWithContestants(proposalBudget, contestingProposals)
  }

  private static createBudgetWithContestants(budget: Budget, contestingProposals: ProposalAttributes[]) {
    const budgetWithContestants: BudgetWithContestants = {
      ...budget,
      total_contested: 0,
    } as unknown as BudgetWithContestants
    for (const category of Object.keys(budget.categories)) {
      const contestedCategoryBudget: CategoryBudgetWithContestants = {
        ...budget.categories[category],
        contested: 0,
        contested_over_available_percentage: 0,
        contestants: [],
      }
      budgetWithContestants.categories[category] = contestedCategoryBudget
    }

    // add contesting proposals
    for (const proposal of contestingProposals) {
      const proposalCategory = snakeCase(proposal.configuration.category)
      const proposalSize = proposal.configuration.size

      budgetWithContestants.categories[proposalCategory].contested += proposalSize
      budgetWithContestants.categories[proposalCategory].contestants.push(this.getContestingGrantProposal(proposal))
      budgetWithContestants.total_contested += proposalSize
    }

    // calculate percentages
    for (const category of Object.keys(budget.categories)) {
      budgetWithContestants.categories[category].contested_over_available_percentage = getUncappedRoundedPercentage(
        budgetWithContestants.categories[category].contested,
        budgetWithContestants.categories[category].available
      )
      for (const contestingGrant of budgetWithContestants.categories[category].contestants) {
        contestingGrant.contested_percentage = getUncappedRoundedPercentage(
          contestingGrant.size,
          budgetWithContestants.categories[category].contested
        )
      }
    }
    return budgetWithContestants
  }

  private static getContestingGrantProposal(proposal: ProposalAttributes) {
    const contestingGrant: ContestingGrantProposal = {
      ...proposal,
      size: proposal.configuration.size,
      contested_percentage: 0,
    }
    return contestingGrant
  }
}
