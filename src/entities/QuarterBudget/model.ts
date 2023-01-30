import Time from 'dayjs'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { snakeCase } from 'lodash'
import { v1 as uuid } from 'uuid'

import { TransparencyBudget } from '../../clients/DclData'
import { ProposalGrantCategory } from '../Proposal/types'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'

import { QuarterBudgetAttributes } from './types'

function toProposalGrantCategory(category: string): ProposalGrantCategory {
  switch (category) {
    case snakeCase(ProposalGrantCategory.Platform):
      return ProposalGrantCategory.Platform
    case snakeCase(ProposalGrantCategory.InWorldContent):
      return ProposalGrantCategory.InWorldContent
    case snakeCase(ProposalGrantCategory.CoreUnit):
      return ProposalGrantCategory.CoreUnit
    case snakeCase(ProposalGrantCategory.Sponsorship):
      return ProposalGrantCategory.Sponsorship
    case snakeCase(ProposalGrantCategory.Accelerator):
      return ProposalGrantCategory.Accelerator
    case snakeCase(ProposalGrantCategory.SocialMediaContent):
      return ProposalGrantCategory.SocialMediaContent
    case snakeCase(ProposalGrantCategory.Documentation):
      return ProposalGrantCategory.Documentation
  }
  throw new Error(`Attempted to parse an invalid ProposalGrantCategory ${category}`)
}

function getCategoryBudgetTotal(categoryPercentage: number, newQuarterBudget: QuarterBudgetAttributes) {
  if (categoryPercentage < 0 || categoryPercentage > 100) {
    throw new Error(`Invalid category percentage`)
  }
  return (categoryPercentage * newQuarterBudget.total) / 100
}

export default class QuarterBudgetModel extends Model<QuarterBudgetAttributes> {
  static tableName = 'quarter_budget'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createNewBudgets(transparencyBudgets: TransparencyBudget[]) {
    const existingBudgets = await this.find<QuarterBudgetAttributes>()
    if (transparencyBudgets.length > existingBudgets.length) {
      const sortedBudgets = transparencyBudgets.sort((a, b) => Date.parse(b.start_date) - Date.parse(a.start_date))
      const now = new Date()
      for (const transparencyBudget of sortedBudgets) {
        const startAt = new Date(transparencyBudget.start_date)
        if (!existingBudgets.some((existingBudget) => existingBudget.start_at === startAt)) {
          const finishAt = Time(transparencyBudget.start_date).add(4, 'months').toDate()
          if (this.thereAreNoOverlappingBudgets(startAt, finishAt, existingBudgets)) {
            this.validateCategoryBudgets(transparencyBudget)
            const newQuarterBudget: QuarterBudgetAttributes = {
              id: uuid(),
              total: transparencyBudget.total,
              start_at: startAt,
              finish_at: finishAt,
              created_at: now,
              updated_at: now,
            }
            await this.create(newQuarterBudget)
            try {
              await this.createCategoryBudgets(newQuarterBudget, transparencyBudget)
            } catch (e) {
              await this.delete(newQuarterBudget)
              throw e
            }
          } else {
            throw new Error(`There are overlapping budgets with: ${transparencyBudget}`)
          }
        }
      }
    }
  }

  private static thereAreNoOverlappingBudgets(
    startAt: Date,
    finishAt: Date,
    existingBudgets: QuarterBudgetAttributes[]
  ) {
    return !existingBudgets.some(
      (existingBudget) =>
        (existingBudget.start_at <= startAt && existingBudget.finish_at > startAt) ||
        (existingBudget.start_at > startAt && existingBudget.start_at < finishAt)
    )
  }

  private static validateCategoryBudgets(transparencyBudget: TransparencyBudget) {
    if (Object.values(transparencyBudget.category_percentages).reduce((prev, next) => prev + next, 0) !== 100) {
      throw new Error(`Categories percentages do not amount to 100 for budget: ${transparencyBudget}`)
    }
  }

  private static async createCategoryBudgets(
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
