import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { GrantProposalConfiguration, ProposalAttributes } from '../Proposal/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'

export type CurrentCategoryBudget = Pick<QuarterCategoryBudgetAttributes, 'total' | 'allocated'> & {
  available: number
}
export type CurrentBudget = {
  id: string
  categories: Record<string, CurrentCategoryBudget>
  allocated: number
} & Pick<QuarterBudgetAttributes, 'start_at' | 'finish_at' | 'total'>

export type ExpectedBudget = Pick<CurrentBudget, 'id' | 'allocated' | 'start_at' | 'finish_at' | 'total'> & {
  categories: Record<string, ExpectedCategoryBudget>
  total_contested: number
}

export type ExpectedCategoryBudget = Pick<CurrentCategoryBudget, 'total' | 'allocated' | 'available'> & {
  contested: number
  contested_over_available_percentage: number
  contestants: ContestingGrantProposal[]
}

export type ContestingGrantProposal = Pick<ProposalAttributes, 'title' | 'id'> &
  Pick<GrantProposalConfiguration, 'size'> & {
    contested_percentage: number
  }

export const NULL_CURRENT_BUDGET: CurrentBudget = {
  allocated: 0,
  categories: {},
  finish_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  start_at: Time.utc('2023-01-01 00:00:00Z').toDate(),
  id: 'null-id',
  total: 0,
}

export const NULL_CURRENT_CATEGORY_BUDGET: CurrentCategoryBudget = {
  allocated: 0,
  available: 0,
  total: 0,
}
