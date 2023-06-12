import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import toSnakeCase from 'lodash/snakeCase'

import { Governance } from '../clients/Governance'
import { ProposalGrantCategory } from '../entities/Grant/types'
import { PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

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
  return Math.ceil(percentage * 100)
}

export default function useBudgetByCategory(category: ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL) {
  const { data: currentBudget } = useQuery({
    queryKey: [`budget`],
    queryFn: () => Governance.get().getCurrentBudget(),
    staleTime: 3.6e6, // 1 hour
  })
  const [budget, setBudget] = useState(INITIAL_BUDGET)

  useEffect(() => {
    if (currentBudget) {
      const { categories, allocated, total } = currentBudget
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
  }, [currentBudget, category])

  return budget
}
