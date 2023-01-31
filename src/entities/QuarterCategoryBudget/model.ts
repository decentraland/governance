import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { TransparencyBudget } from '../../clients/DclData'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'

import { QuarterCategoryBudgetAttributes } from './types'
import { getCategoryBudgetTotal, toProposalGrantCategory } from './utils'

export default class QuarterCategoryBudgetModel extends Model<QuarterCategoryBudgetAttributes> {
  static tableName = 'quarter_category_budgets'
  static withTimestamps = false
  static primaryKey = 'quarter_budget_id'

  public static async createCategoryBudgets(
    newQuarterBudget: QuarterBudgetAttributes,
    transparencyBudget: TransparencyBudget
  ) {
    for (const category of Object.keys(transparencyBudget.category_percentages)) {
      const categoryPercentage = transparencyBudget.category_percentages[category]
      const newQuarterCategoryBudget: QuarterCategoryBudgetAttributes = {
        quarter_budget_id: newQuarterBudget.id,
        category: toProposalGrantCategory(category),
        total: getCategoryBudgetTotal(categoryPercentage, newQuarterBudget),
        allocated: 0,
        created_at: newQuarterBudget.created_at,
        updated_at: newQuarterBudget.updated_at,
      }
      await QuarterCategoryBudgetModel.create(newQuarterCategoryBudget)
    }
  }
}
