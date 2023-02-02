import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'

import { DclData, TransparencyBudget } from '../clients/DclData'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import { QuarterBudgetAttributes } from '../entities/QuarterBudget/types'

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
}
