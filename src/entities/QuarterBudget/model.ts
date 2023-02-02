import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'

import { TransparencyBudget } from '../../clients/DclData'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'
import { validateCategoryBudgets } from '../QuarterCategoryBudget/utils'

import { QuarterBudgetAttributes } from './types'
import {
  budgetExistsForStartingDate,
  getQuarterEndDate,
  getQuarterStartDate,
  getSortedBudgets,
  thereAreNoOverlappingBudgets,
} from './utils'

export default class QuarterBudgetModel extends Model<QuarterBudgetAttributes> {
  static tableName = 'quarter_budgets'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createNewBudgets(transparencyBudgets: TransparencyBudget[]) {
    const existingBudgets = await this.find<QuarterBudgetAttributes>()
    const newBudgets: QuarterBudgetAttributes[] = []
    if (transparencyBudgets.length > existingBudgets.length) {
      const sortedBudgets = getSortedBudgets(transparencyBudgets)
      const now = new Date()
      for (const transparencyBudget of sortedBudgets) {
        try {
          const startAt = getQuarterStartDate(transparencyBudget.start_date)
          if (!budgetExistsForStartingDate(existingBudgets, startAt)) {
            const finishAt = getQuarterEndDate(startAt)
            if (thereAreNoOverlappingBudgets(startAt, finishAt, existingBudgets)) {
              validateCategoryBudgets(transparencyBudget)
              const newQuarterBudget = this.getNewQuarterBudget(transparencyBudget, startAt, finishAt, now)
              await this.saveAndCreateCategoryBudgets(newQuarterBudget, transparencyBudget, (newBudget) => {
                newBudgets.push(newBudget)
                existingBudgets.push(newBudget)
              })
            } else {
              throw new Error(`There are overlapping budgets with: ${JSON.stringify(transparencyBudget)}`)
            }
          }
        } catch (e) {
          this.logCreatedBudgets(newBudgets)
          throw e
        }
      }
    }

    this.logCreatedBudgets(newBudgets)
    return newBudgets
  }

  private static getNewQuarterBudget(transparencyBudget: TransparencyBudget, startAt: Date, finishAt: Date, now: Date) {
    const newQuarterBudget: QuarterBudgetAttributes = {
      id: uuid(),
      total: transparencyBudget.total,
      start_at: startAt,
      finish_at: finishAt,
      created_at: now,
      updated_at: now,
    }
    return newQuarterBudget
  }

  private static logCreatedBudgets(newBudgets: QuarterBudgetAttributes[]) {
    console.log(`Created ${newBudgets.length} new budgets`)
    console.log(`New budgets: ${JSON.stringify(newBudgets)}`)
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
      await this.delete({ id: newQuarterBudget.id })
      throw e
    }
  }
}
