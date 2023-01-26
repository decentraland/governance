import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import { snakeCase } from 'lodash'

import { NewGrantCategory, OldGrantCategory } from './../Grant/types'

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
    // TODO: Remove old. Done this to fix typing
    [snakeCase(OldGrantCategory.PlatformContributor)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(OldGrantCategory.Community)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(OldGrantCategory.Gaming)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(OldGrantCategory.ContentCreator)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
  },
}

export default routes((route) => {
  route.get('/budget/:category', handleAPI(getCategoryBudget))
})

async function getCategoryBudget(req: Request) {
  const { category } = req.params

  return BUDGET.categories[category as NewGrantCategory]
}
