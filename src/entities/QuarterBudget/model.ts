import Time from 'dayjs'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'

import { TransparencyBudget } from '../../clients/DclData'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'
import { validateCategoryBudgets } from '../QuarterCategoryBudget/utils'

import { QuarterBudgetAttributes } from './types'
import { thereAreNoOverlappingBudgets } from './utils'

export default class QuarterBudgetModel extends Model<QuarterBudgetAttributes> {
  static tableName = 'quarter_budgets'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createNewBudgets(transparencyBudgets: TransparencyBudget[]) {
    const existingBudgets = await this.find<QuarterBudgetAttributes>()
    const newBudgets: QuarterBudgetAttributes[] = []
    if (transparencyBudgets.length > existingBudgets.length) {
      const sortedBudgets = transparencyBudgets.sort((a, b) => Date.parse(b.start_date) - Date.parse(a.start_date))
      const now = new Date()
      for (const transparencyBudget of sortedBudgets) {
        const startAt = new Date(transparencyBudget.start_date)
        if (!existingBudgets.some((existingBudget) => existingBudget.start_at === startAt)) {
          const finishAt = Time(transparencyBudget.start_date).add(4, 'months').toDate() //TODO a chequear
          if (thereAreNoOverlappingBudgets(startAt, finishAt, existingBudgets)) {
            validateCategoryBudgets(transparencyBudget)
            const newQuarterBudget: QuarterBudgetAttributes = {
              id: uuid(),
              total: transparencyBudget.total,
              start_at: startAt,
              finish_at: finishAt,
              created_at: now,
              updated_at: now,
            }
            await this.saveAndCreateCategoryBudgets(newQuarterBudget, transparencyBudget, (newBudget) =>
              newBudgets.push(newBudget)
            )
          } else {
            throw new Error(`There are overlapping budgets with: ${transparencyBudget}`)
          }
        }
      }
    }

    console.log(`Created ${newBudgets.length} new budgets`)
    console.log(`New budgets: ${JSON.stringify(newBudgets)}`)
    console.log(`Existing budgets: ${JSON.stringify(existingBudgets)}`)
    return [...existingBudgets, ...newBudgets]
  }

  private static async saveAndCreateCategoryBudgets(
    newQuarterBudget: QuarterBudgetAttributes,
    transparencyBudget: TransparencyBudget,
    onSuccess: (newBudget: QuarterBudgetAttributes) => void
  ) {
    await this.create(newQuarterBudget)
    try {
      await QuarterCategoryBudgetModel.createCategoryBudgets(newQuarterBudget, transparencyBudget)
      onSuccess(newQuarterBudget)
    } catch (e) {
      await this.delete(newQuarterBudget)
      throw e
    }
  }
}
