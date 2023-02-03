import { useEffect, useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import toSnakeCase from 'lodash/snakeCase'

import { PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

import { Governance } from './../clients/Governance'
import { ProposalGrantCategory } from './../entities/Grant/types'

type Budget = {
  percentage: number
  currentAmount: number
  totalBudget: number
}

const INITIAL_BUDGET: Budget = {
  percentage: 0,
  currentAmount: 0,
  totalBudget: 0,
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
          percentage: convertPercentageToInt(allocated / total),
          currentAmount: allocated,
          totalBudget: total,
        })
      } else {
        const categoryBudget = categories[toSnakeCase(category)]
        if (categoryBudget) {
          setBudget({
            percentage: convertPercentageToInt(categoryBudget.allocated / categoryBudget.total),
            currentAmount: categoryBudget.allocated,
            totalBudget: categoryBudget.total,
          })
        } else {
          setBudget(INITIAL_BUDGET)
        }
      }
    }
  }, [budgetData, category])

  return budget
}
