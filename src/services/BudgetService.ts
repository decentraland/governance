import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'

import { DclData, TransparencyBudget } from '../clients/DclData'
import {
  CurrentBudget,
  CurrentCategoryBudget,
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

import { ErrorService } from './ErrorService'

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
    } else {
      ErrorService.report('Could not find current budget')
      return NULL_CURRENT_BUDGET
    }
  }

  static async getCategoryBudget(category: NewGrantCategory): Promise<CurrentCategoryBudget> {
    const categoryBudget = await QuarterBudgetModel.getCategoryBudgetForCurrentQuarter(category)
    if (categoryBudget !== null) {
      const { total, allocated } = categoryBudget
      return { total, allocated, available: total - allocated }
    } else {
      ErrorService.report(`Could not find category budget for current quarter. Category: ${category}`)
      return NULL_CURRENT_CATEGORY_BUDGET
    }
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

  static async getBudgets(proposals: Pick<ProposalAttributes, 'start_at'>[]): Promise<CurrentBudget[]> {
    const budgetsForProposals: CurrentBudget[] = []
    const { minDate, maxDate } = this.getProposalsBudgetingMinAndMaxDates(proposals)
    if (!minDate) return budgetsForProposals
    const oldestBudget = await QuarterBudgetModel.getBudget(minDate)
    if (oldestBudget === null) {
      ErrorService.report(`Could not find budget for ${minDate}`)
      return budgetsForProposals
    }
    budgetsForProposals.push(oldestBudget)
    if (maxDate && minDate !== maxDate) {
      const newestBudget = await QuarterBudgetModel.getBudget(maxDate)
      if (newestBudget !== null) {
        const index = budgetsForProposals.findIndex((budget) => budget.id === newestBudget.id)
        if (index === -1) budgetsForProposals.push(newestBudget)
      }
    }
    return budgetsForProposals
  }

  static async updateBudgets(budgetUpdates: CurrentBudget[]) {
    budgetUpdates.forEach(await QuarterBudgetModel.updateBudget)
  }
}
