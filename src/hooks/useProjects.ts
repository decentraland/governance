import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { getQuarterDates } from '../helpers'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

type DateFilter = {
  year: number
  quarter: number
}

export default function useProjects(dateFilter?: Partial<DateFilter>) {
  const { year, quarter } = dateFilter || {}
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', year, quarter],
    queryFn: async () => {
      const { startDate, endDate } = getQuarterDates(quarter, year)
      const from = startDate ? new Date(startDate) : undefined
      const to = endDate ? new Date(endDate) : undefined
      return Governance.get().getProjects(from, to)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    projects,
    isLoadingProjects,
  }
}
