import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import snakeCase from 'lodash/snakeCase'
import { v1 as uuid } from 'uuid'

import { TransparencyBudget } from '../../clients/DclData'
import { CurrentBudget, CurrentCategoryBudget } from '../Budget/types'
import { NewGrantCategory } from '../Grant/types'
import { asNumber } from '../Proposal/utils'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'
import { toNewGrantCategory, validateCategoryBudgets } from '../QuarterCategoryBudget/utils'

import { CurrentBudgetQueryResult, QuarterBudgetAttributes } from './types'
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
    if (newBudgets.length > 0) console.log(`New budgets: ${JSON.stringify(newBudgets)}`)
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

  static async getCurrentBudget(): Promise<CurrentBudget | null> {
    const now = new Date()
    const query = SQL`
        SELECT qb.id, qcb.category, qcb.total as category_total, qcb.allocated as category_allocated, qb.start_at, qb.finish_at, qb.total
        FROM ${table(QuarterCategoryBudgetModel)} as qcb 
        INNER JOIN ${table(QuarterBudgetModel)} as qb
        ON qcb.quarter_budget_id = qb.id
        WHERE 
          qb.start_at <= ${now} AND
          qb.finish_at > ${now}
    `

    const result = await this.query(query)
    if (!result || result.length === 0) {
      return null
    }
    return this.parseCurrentBudget(result)
  }

  static async getBudgetForDate(dateWithinBudget: Date): Promise<CurrentBudget | null> {
    const query = SQL`
        SELECT 
          qb.id, qb.start_at, qb.finish_at,
          qcb.category, qcb.total as category_total, qcb.allocated as category_allocated, qb.total
          FROM ${table(QuarterCategoryBudgetModel)} as qcb 
          INNER JOIN (
              SELECT b.* 
              FROM ${table(QuarterBudgetModel)} as b
              WHERE 
                 b.start_at <= ${dateWithinBudget}
                AND b.finish_at > ${dateWithinBudget}
          ) as qb
          ON qcb.quarter_budget_id = qb.id;
    `

    const result = await this.query(query)
    if (!result || result.length === 0) {
      return null
    }
    return this.parseCurrentBudget(result)
  }

  static async getCategoryBudgetForCurrentQuarter(
    category: NewGrantCategory
  ): Promise<QuarterCategoryBudgetAttributes | null> {
    const now = new Date()
    const query = SQL`
        SELECT qcb.*
        FROM ${table(QuarterCategoryBudgetModel)} as qcb 
        INNER JOIN ${table(QuarterBudgetModel)} as qb
        ON qcb.quarter_budget_id = qb.id
        WHERE 
          qcb.category = ${category} AND
          qb.start_at <= ${now} AND
          qb.finish_at > ${now}
    `

    const result = await this.query(query)
    if (!result || result.length !== 1) {
      return null
    }
    return result[0]
  }

  public static async updateBudget(budgetUpdate: CurrentBudget) {
    const now = new Date()
    const categories = Object.keys(budgetUpdate.categories)
    for (const category of categories) {
      const newGrantCategory = toNewGrantCategory(category)
      const categoryBudget = budgetUpdate.categories[category]
      const query = SQL`
        UPDATE ${table(QuarterCategoryBudgetModel)}
        SET "allocated" = ${categoryBudget.allocated},
            "updated_at" = ${now}
        WHERE "quarter_budget_id" = ${budgetUpdate.id}
        AND "category" = ${newGrantCategory} 
         `
      await this.query(query)
    }
  }

  static parseCurrentBudget(result: CurrentBudgetQueryResult[]): CurrentBudget {
    const categoriesResults: Record<string, CurrentCategoryBudget> = {}
    result.forEach((categoryResult) => {
      const { category_total, category_allocated } = categoryResult
      const total = asNumber(category_total)
      const allocated = asNumber(category_allocated)

      categoriesResults[snakeCase(categoryResult.category)] = {
        total,
        allocated,
        available: total - allocated,
      }
    })

    return {
      id: result[0].id,
      start_at: Time.date(result[0].start_at),
      finish_at: Time.date(result[0].finish_at),
      total: asNumber(result[0].total),
      allocated: Object.values(categoriesResults).reduce((acc, category) => acc + category.allocated, 0),
      categories: categoriesResults,
    }
  }
}
