import { snakeCase } from 'lodash'

import { TransparencyBudget } from '../../clients/DclData'
import { ProposalGrantCategory } from '../Proposal/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'

export function toProposalGrantCategory(category: string): ProposalGrantCategory {
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
