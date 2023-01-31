import { snakeCase } from 'lodash'

import { TransparencyBudget } from '../../clients/DclData'
import { NewGrantCategory } from '../Grant/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'

export function toNewGrantCategory(category: string) {
  const categories = Object.values(NewGrantCategory)
  const idx = categories.map(snakeCase).findIndex((value) => value === snakeCase(category))

  if (idx >= 0) {
    return categories[idx]
  }

  throw Error(`Attempted to parse an invalid NewGrantCategory ${category}`)
}

export function getCategoryBudgetTotal(categoryPercentage: number, newQuarterBudget: QuarterBudgetAttributes) {
  if (categoryPercentage < 0 || categoryPercentage > 100) {
    throw new Error(`Invalid category percentage`)
  }
  return (categoryPercentage * newQuarterBudget.total) / 100
}

export function validateCategoryBudgets(transparencyBudget: TransparencyBudget) {
  if (Object.values(transparencyBudget.category_percentages).reduce((prev, next) => prev + next, 0) !== 100) {
    throw new Error(`Categories percentages do not amount to 100 for budget: ${transparencyBudget}`)
  }
}
