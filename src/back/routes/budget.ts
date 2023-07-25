import { auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { TransparencyBudget } from '../../clients/DclData'
import { Budget, BudgetWithContestants, CategoryBudget } from '../../entities/Budget/types'
import { QuarterBudgetAttributes } from '../../entities/QuarterBudget/types'
import { toNewGrantCategory } from '../../entities/QuarterCategoryBudget/utils'
import { BudgetService } from '../../services/BudgetService'

export default routes((route) => {
  const withAuth = auth()
  route.get('/budget/fetch/', handleAPI(fetchBudgets))
  route.post('/budget/update/', withAuth, handleAPI(updateBudgets))
  route.get('/budget/current', handleAPI(getCurrentBudget))
  route.get('/budget/current-contested', handleAPI(getCurrentContestedBudget))
  route.get('/budget/contested/:proposal', handleAPI(getBudgetWithContestants))
  route.get('/budget/:category', handleAPI(getCategoryBudget))
})

async function getCategoryBudget(req: Request): Promise<CategoryBudget> {
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

async function getCurrentBudget(): Promise<Budget> {
  return await BudgetService.getCurrentBudget()
}

async function getCurrentContestedBudget(): Promise<BudgetWithContestants> {
  return await BudgetService.getCurrentContestedBudget()
}

async function getBudgetWithContestants(req: Request<{ proposal: string }>): Promise<BudgetWithContestants> {
  return await BudgetService.getBudgetWithContestants(req.params.proposal)
}
