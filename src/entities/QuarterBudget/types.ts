export type QuarterBudgetAttributes = {
  id: string
  start_at: Date
  finish_at: Date
  total: number
  created_at: Date
  updated_at: Date
}

export interface BudgetQueryResult {
  id: string
  category: string
  category_total: number
  category_allocated: number
  start_at: string
  finish_at: string
  total: number
}
