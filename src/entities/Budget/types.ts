import Time from 'decentraland-gatsby/dist/utils/date/Time'
import snakeCase from 'lodash/snakeCase'

import { NewGrantCategory } from '../Grant/types'
import { GrantProposalConfiguration, ProposalAttributes } from '../Proposal/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'

export type CategoryBudget = Pick<QuarterCategoryBudgetAttributes, 'total' | 'allocated'> & {
  available: number
}
export type Budget = {
  id: string
  categories: Record<string, CategoryBudget>
  allocated: number
} & Pick<QuarterBudgetAttributes, 'start_at' | 'finish_at' | 'total'>

export type BudgetWithContestants = Pick<Budget, 'id' | 'allocated' | 'start_at' | 'finish_at' | 'total'> & {
  categories: Record<string, CategoryBudgetWithContestants>
  total_contested: number
}

export type CategoryBudgetWithContestants = Pick<CategoryBudget, 'total' | 'allocated' | 'available'> & {
  contested: number
  contested_over_available_percentage: number
  contestants: ContestingGrantProposal[]
}

export type ContestingGrantProposal = ProposalAttributes &
  Pick<GrantProposalConfiguration, 'size'> & {
    contested_percentage: number
  }

function getNullCategoryBudgets() {
  const categories: Record<string, CategoryBudget> = {}
  Object.keys(NewGrantCategory)
    .map(snakeCase)
    .forEach((category) => {
      categories[category] = {
        total: 0,
        allocated: 0,
        available: 0,
      }
    })
  return categories
}

function getNullContestedCategoryBudgets() {
  const categories: Record<string, CategoryBudgetWithContestants> = {}
  Object.keys(NewGrantCategory)
    .map(snakeCase)
    .forEach((category) => {
      categories[category] = {
        total: 0,
        allocated: 0,
        available: 0,
        contested: 0,
        contested_over_available_percentage: 0,
        contestants: [],
      }
    })
  return categories
}

export const NULL_BUDGET: Budget = {
  allocated: 0,
  categories: getNullCategoryBudgets(),
  finish_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  start_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  id: 'null-id',
  total: 0,
}

export const NULL_CATEGORY_BUDGET: CategoryBudget = {
  allocated: 0,
  available: 0,
  total: 0,
}

export const NULL_CONTESTED_BUDGET: BudgetWithContestants = {
  total_contested: 0,
  allocated: 0,
  categories: getNullContestedCategoryBudgets(),
  finish_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  start_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  id: 'null-id',
  total: 0,
}