import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import Time from '../utils/date/Time'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function getQuarterDates(quarter: number, year: number) {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter should be between 1 and 4')
  }

  const startMonth = (quarter - 1) * 3 + 1

  const endMonth = startMonth + 2

  const startDate = Time(`${year}-${startMonth}-01`).startOf('month').format('YYYY-MM-DD')
  const endDate = Time(`${year}-${endMonth}-01`).endOf('month').add(1, 'day').format('YYYY-MM-DD')

  return { startDate, endDate }
}

type DateFilter = {
  year: number
  quarter: number
}

export default function useProjects(dateFilter?: DateFilter) {
  const { year, quarter } = dateFilter || {}
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', year, quarter],
    queryFn: async () => {
      const { startDate, endDate } =
        quarter && year ? getQuarterDates(quarter, year) : { startDate: undefined, endDate: undefined }
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
