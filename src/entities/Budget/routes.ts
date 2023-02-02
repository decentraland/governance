import { auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import { snakeCase } from 'lodash'

import { TransparencyBudget } from '../../clients/DclData'
import { BudgetService } from '../../services/BudgetService'
import { NewGrantCategory } from '../Grant/types'
import { QuarterBudgetAttributes } from '../QuarterBudget/types'
import { QuarterCategoryBudgetAttributes } from '../QuarterCategoryBudget/types'
import { toNewGrantCategory } from '../QuarterCategoryBudget/utils'

import { CurrentBudget } from './types'

// TODO: This object should be generated dynamically, calculating budget available from passed/enacted proposals
export const BUDGET = {
  start_date: '',
  total: 1501500,
  categories: {
    [snakeCase(NewGrantCategory.Platform)]: {
      total: 600600,
      available: 600600,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.InWorldContent)]: {
      total: 300300,
      available: 300300,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.CoreUnit)]: {
      total: 225225,
      available: 225225,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.Sponsorship)]: {
      total: 150150,
      available: 150150,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.Accelerator)]: {
      total: 75075,
      available: 75075,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.SocialMediaContent)]: {
      total: 75075,
      available: 75075,
      allocated: 0,
    },
    [snakeCase(NewGrantCategory.Documentation)]: {
      total: 45045,
      available: 45045,
      allocated: 0,
    },
  },
}

export default routes((route) => {
  const withAuth = auth()
  route.get('/budget/fetch/', handleAPI(fetchBudgets))
  route.post('/budget/update/', withAuth, handleAPI(updateBudgets))
  route.get('/budget/current', handleAPI(getCurrentBudget))
  route.get('/budget/:category', handleAPI(getCategoryBudget))
})

async function getCategoryBudget(req: Request): Promise<QuarterCategoryBudgetAttributes> {
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
