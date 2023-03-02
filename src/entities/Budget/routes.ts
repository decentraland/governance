import { auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { TransparencyBudget } from '../../clients/DclData'
import { BudgetService } from '../../services/BudgetService'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'
import { toNewGrantCategory } from '../QuarterCategoryBudget/utils'

import { CurrentBudget, CurrentCategoryBudget } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.get('/budget/fetch/', handleAPI(fetchBudgets))
  route.post('/budget/update/', withAuth, handleAPI(updateBudgets))
  route.get('/budget/current', handleAPI(getCurrentBudget))
  route.get('/budget/expected', handleAPI(getExpectedAllocatedBudget))
  route.get('/budget/:category', handleAPI(getCategoryBudget))
})

async function getCategoryBudget(req: Request): Promise<CurrentCategoryBudget> {
  const { category } = req.params
  const grantCategory = toNewGrantCategory(category)
  return await BudgetService.getCategoryBudget(grantCategory)
}

async function updateBudgets(): Promise<QuarterBudgetAttributes[]> {
  return await BudgetService.updateGovernanceBudgets()
}

async function fetchBudgets(): Promise<TransparencyBudget[]> {
  return await BudgetService.getTransparencyBudgets()
}

async function getCurrentBudget(): Promise<CurrentBudget> {
  return await BudgetService.getCurrentBudget()
}

async function getExpectedAllocatedBudget(): Promise<Record<string, any>> {
  return await BudgetService.getExpectedAllocatedBudget()
}
