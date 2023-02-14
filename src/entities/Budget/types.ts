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
