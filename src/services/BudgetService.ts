import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import snakeCase from 'lodash/snakeCase'

import { DclData, TransparencyBudget } from '../clients/DclData'
import {
  ContestingGrantProposal,
  CurrentBudget,
  CurrentCategoryBudget,
  ExpectedBudget,
  ExpectedCategoryBudget,
  NULL_CURRENT_BUDGET,
  NULL_CURRENT_CATEGORY_BUDGET,
} from '../entities/Budget/types'
import { BUDGETING_START_DATE } from '../entities/Grant/constants'
import { NewGrantCategory } from '../entities/Grant/types'
import { isValidGrantBudget } from '../entities/Grant/utils'
import { ProposalAttributes } from '../entities/Proposal/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import { QuarterBudgetAttributes } from '../entities/QuarterBudget/types'
import { toNewGrantCategory } from '../entities/QuarterCategoryBudget/utils'
import { getUncappedRoundedPercentage } from '../helpers'

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
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        core_unit: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        documentation: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        in_world_content: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        platform: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        social_media_content: {
          type: 'integer',
          minimum: 0,
          maximum: 100,
        },
        sponsorship: {
          type: 'integer',
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
      budgets = await DclData.get().getBudgets()
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
    console.log('Transparency budgets: ', JSON.stringify(budgets))
    return budgets
  }

  public static async updateGovernanceBudgets(): Promise<QuarterBudgetAttributes[]> {
    const transparencyBudgets = await this.getTransparencyBudgets()
    return await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
  }

  static async getCurrentBudget(): Promise<CurrentBudget> {
    const currentBudget = await QuarterBudgetModel.getCurrentBudget()
    if (currentBudget !== null) {
      return currentBudget
    }
    ErrorService.report('Could not find current budget')
    return NULL_CURRENT_BUDGET
  }

  static async getCategoryBudget(category: NewGrantCategory): Promise<CurrentCategoryBudget> {
    const categoryBudget = await QuarterBudgetModel.getCategoryBudgetForCurrentQuarter(category)
    if (categoryBudget !== null) {
      const { total, allocated } = categoryBudget
      return { total, allocated, available: total - allocated }
    }
    ErrorService.report(`Could not find category budget for current quarter. Category: ${category}`)
    return NULL_CURRENT_CATEGORY_BUDGET
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

  static async getBudgetsForProposals(proposals: Pick<ProposalAttributes, 'start_at'>[]): Promise<CurrentBudget[]> {
    const budgetsForProposals: CurrentBudget[] = []
    const { minDate, maxDate } = this.getProposalsBudgetingMinAndMaxDates(proposals)
    if (!minDate) return budgetsForProposals
    const oldestBudget = await QuarterBudgetModel.getBudgetForDate(minDate)
    if (oldestBudget === null) {
      ErrorService.report(`Could not find budget for ${minDate}`)
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

  static async updateBudgets(budgets: CurrentBudget[]) {
    for (const budget of budgets) {
      await QuarterBudgetModel.updateBudget(budget)
    }
  }

  static async getExpectedAllocatedBudget() {
    const activeGrantProposals = await ProposalService.getActiveGrantProposals()
    const currentBudget = await this.getCurrentBudget()
    const expectedBudget: ExpectedBudget = this.initializeExpectedBudget(currentBudget)

    // add contesting proposals
    for (const proposal of activeGrantProposals) {
      const proposalCategory = snakeCase(proposal.configuration.category)
      const proposalSize = proposal.configuration.size

      expectedBudget.categories[proposalCategory].contested += proposalSize
      expectedBudget.categories[proposalCategory].contestants.push(this.getContestingGrantProposal(proposal))
      expectedBudget.total_contested += proposalSize
    }

    // calculate percentages
    for (const category of Object.keys(currentBudget.categories)) {
      expectedBudget.categories[category].contested_over_available_percentage = getUncappedRoundedPercentage(
        expectedBudget.categories[category].contested,
        expectedBudget.categories[category].available
      )
      for (const contestingGrant of expectedBudget.categories[category].contestants) {
        contestingGrant.contested_percentage = getUncappedRoundedPercentage(
          contestingGrant.size,
          expectedBudget.categories[category].contested
        )
      }
    }
    return expectedBudget
  }

  private static initializeExpectedBudget(currentBudget: CurrentBudget): ExpectedBudget {
    const expectedBudget: ExpectedBudget = { ...currentBudget, total_contested: 0 } as any as ExpectedBudget
    for (const category of Object.keys(currentBudget.categories)) {
      const expectedCategoryBudget: ExpectedCategoryBudget = {
        ...currentBudget.categories[category],
        contested: 0,
        contested_over_available_percentage: 0,
        contestants: [],
      }
      expectedBudget.categories[category] = expectedCategoryBudget
    }
    return expectedBudget
  }

  private static getContestingGrantProposal(proposal: ProposalAttributes) {
    const contestingGrant: ContestingGrantProposal = {
      title: proposal.title,
      id: proposal.id,
      size: proposal.configuration.size,
      contested_percentage: 0,
    }
    return contestingGrant
  }
}
