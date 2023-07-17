import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { BudgetService } from '../../services/BudgetService'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'

export async function updateGovernanceBudgets(context: JobContext) {
  try {
    await BudgetService.updateGovernanceBudgets()
  } catch (error) {
    ErrorService.report('Error updating budgets', { error, category: ErrorCategory.BudgetError })
    context.log('Unexpected error while updating budgets', error as Error)
  }
}
