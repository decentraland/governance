import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import { snakeCase } from 'lodash'

import { ProposalGrantCategory } from '../Proposal/types'

// TODO: This object should be generated dynamically, calculating budget available from passed/enacted proposals
export const BUDGET = {
  start_date: '',
  total: 1501500,
  categories: {
    [snakeCase(ProposalGrantCategory.Platform)]: {
      total: 600600,
      available: 600600,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.InWorldContent)]: {
      total: 300300,
      available: 300300,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.CoreUnit)]: {
      total: 225225,
      available: 225225,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.Sponsorship)]: {
      total: 150150,
      available: 150150,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.Accelerator)]: {
      total: 75075,
      available: 75075,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.SocialMediaContent)]: {
      total: 75075,
      available: 75075,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.Documentation)]: {
      total: 45045,
      available: 45045,
      allocated: 0,
    },
    // TODO: Remove old. Done this to fix typing
    [snakeCase(ProposalGrantCategory.PlatformContributor)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.Community)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.Gaming)]: {
      total: 0,
      available: 0,
      allocated: 0,
    },
    [snakeCase(ProposalGrantCategory.ContentCreator)]: {
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

  return BUDGET.categories[category as ProposalGrantCategory]
}
