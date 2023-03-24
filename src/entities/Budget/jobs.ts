import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { BudgetService } from '../../services/BudgetService'
import { ErrorService } from '../../services/ErrorService'

export async function updateGovernanceBudgets(context: JobContext) {
  context.log(`Updating budgets...`)
  try {
    await BudgetService.updateGovernanceBudgets()
  } catch (e) {
    ErrorService.report('Unexpected error while updating budgets: ', e)
    context.log('Unexpected error while updating budgets', e as Error)
  }
}
