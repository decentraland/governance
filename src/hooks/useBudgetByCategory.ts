import { useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import toSnakeCase from 'lodash/snakeCase'

import { Governance } from '../clients/Governance'
import { SubtypeAlternativeOptions, SubtypeOptions } from '../entities/Grant/types'
import { getQuarterDates } from '../helpers'
import Time from '../utils/date/Time'

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

function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export default function useBudgetByCategory(category: SubtypeOptions, year?: number | null, quarter?: number | null) {
  const { data: allBudgets } = useQuery({
    queryKey: ['all-budgets'],
    queryFn: () => Governance.get().getAllBudgets(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  const [budget, setBudget] = useState(INITIAL_BUDGET)

  const currentYear = year ?? Time().year()
  const currentQuarter = quarter ?? Time().quarter()

  const { startDate, endDate } = getQuarterDates(currentQuarter, currentYear)

  const currentBudget = useMemo(
    () =>
      allBudgets?.find(
        (budget) =>
          isSameDate(new Date(budget.start_at), new Date(startDate || 0)) &&
          isSameDate(new Date(budget.finish_at), new Date(endDate || 0))
      ),
    [allBudgets, endDate, startDate]
  )

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
