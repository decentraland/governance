import { useEffect, useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import toSnakeCase from 'lodash/snakeCase'

import { PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

import { Governance } from './../clients/Governance'
import { ProposalGrantCategory } from './../entities/Grant/types'

type Budget = {
  allocatedPercentage: number
  allocated: number
  total: number
}

const INITIAL_BUDGET: Budget = {
  allocatedPercentage: 0,
  allocated: 0,
  total: 0,
}

function convertPercentageToInt(percentage: number): number {
  return Math.round(percentage * 100)
}

export default function useBudgetByCategory(category: ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL) {
  const [budgetData] = useAsyncMemo(() => Governance.get().getCurrentBudget(), [])
  const [budget, setBudget] = useState(INITIAL_BUDGET)

  useEffect(() => {
    if (budgetData) {
      const { categories, allocated, total } = budgetData
      if (category === PROPOSAL_GRANT_CATEGORY_ALL) {
        setBudget({
          allocatedPercentage: convertPercentageToInt(allocated / total),
          allocated,
          total,
        })
      } else {
        const categoryBudget = categories[toSnakeCase(category)]
        if (categoryBudget) {
          setBudget({
            allocatedPercentage: convertPercentageToInt(categoryBudget.allocated / categoryBudget.total),
            allocated: categoryBudget.allocated,
            total: categoryBudget.total,
          })
        } else {
          setBudget(INITIAL_BUDGET)
        }
      }
    }
  }, [budgetData, category])

  return budget
}
