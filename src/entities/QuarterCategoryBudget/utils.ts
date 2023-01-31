import { snakeCase } from 'lodash'

import { TransparencyBudget } from '../../clients/DclData'
import { NewGrantCategory } from '../Grant/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'

export function toNewGrantCategory(category: string): NewGrantCategory {
  switch (category) {
    case snakeCase(NewGrantCategory.Platform):
      return NewGrantCategory.Platform
    case snakeCase(NewGrantCategory.InWorldContent):
      return NewGrantCategory.InWorldContent
    case snakeCase(NewGrantCategory.CoreUnit):
      return NewGrantCategory.CoreUnit
    case snakeCase(NewGrantCategory.Sponsorship):
      return NewGrantCategory.Sponsorship
    case snakeCase(NewGrantCategory.Accelerator):
      return NewGrantCategory.Accelerator
    case snakeCase(NewGrantCategory.SocialMediaContent):
      return NewGrantCategory.SocialMediaContent
    case snakeCase(NewGrantCategory.Documentation):
      return NewGrantCategory.Documentation
  }
  throw new Error(`Attempted to parse an invalid NewGrantCategory ${category}`)
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
