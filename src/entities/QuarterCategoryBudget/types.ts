import { ProposalGrantCategory } from '../Proposal/types'

export type QuarterCategoryBudgetAttributes = {
  quarter_budget_id: string
  category: ProposalGrantCategory
  total: number
  allocated: number
  created_at: Date
  updated_at: Date
}
