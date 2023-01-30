import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { QuarterCategoryBudgetAttributes } from './types'

export default class QuarterCategoryBudgetModel extends Model<QuarterCategoryBudgetAttributes> {
  static tableName = 'quarter_category_budgets'
  static withTimestamps = false
  static primaryKey = 'quarter_budget_id'
}
