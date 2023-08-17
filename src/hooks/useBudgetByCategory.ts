import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import toSnakeCase from 'lodash/snakeCase'

import { Governance } from '../clients/Governance'
import { SubtypeAlternativeOptions, SubtypeOptions } from '../entities/Grant/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

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

export default function useBudgetByCategory(category: SubtypeOptions) {
  const { data: currentBudget } = useQuery({
    queryKey: ['budget'],
    queryFn: () => Governance.get().getCurrentBudget(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  const [budget, setBudget] = useState(INITIAL_BUDGET)

  useEffect(() => {
    if (currentBudget) {
      const { categories, allocated, total } = currentBudget
      if (category === SubtypeAlternativeOptions.All) {
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
