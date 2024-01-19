import snakeCase from 'lodash/snakeCase'

import { TransparencyBudget } from '../../clients/Transparency'
import { NewGrantCategory } from '../Grant/types'

export function toNewGrantCategory(category: string | null): NewGrantCategory {
  if (category != null && category.length > 0) {
    const categories = Object.values(NewGrantCategory)
    const idx = categories.map(snakeCase).findIndex((value) => value === snakeCase(category))

    if (idx >= 0) {
      return categories[idx]
    }
  }
  throw Error(`Attempted to parse an invalid NewGrantCategory: ${category}`)
}

export function getCategoryBudgetTotal(categoryPercentage: number, total: number) {
  if (categoryPercentage < 0 || categoryPercentage > 100) {
    throw new Error(`Invalid category percentage`)
  }
  return (categoryPercentage * total) / 100
}

export function validateCategoryBudgets(transparencyBudget: TransparencyBudget) {
  if (Object.values(transparencyBudget.category_percentages).reduce((prev, next) => prev + next, 0) !== 100) {
    throw new Error(`Categories percentages do not amount to 100 for budget: ${JSON.stringify(transparencyBudget)}`)
  }
}
