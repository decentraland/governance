import { QuarterBudgetAttributes } from '../QuarterBudget/types'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'

export type CurrentCategoryBudget = Pick<QuarterCategoryBudgetAttributes, 'total' | 'allocated'> & { available: number }
export type CurrentBudget = {
  categories: Record<string, CurrentCategoryBudget>
} & Pick<QuarterBudgetAttributes, 'start_at' | 'finish_at' | 'total'>
