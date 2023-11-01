import { useInfiniteQuery } from '@tanstack/react-query'

import { DEFAULT_QUERY_STALE_TIME } from './constants'
import { UseProposalsFilter, getProposalsQueryFn } from './useProposals'

const DEFAULT_ITEMS_PER_PAGE = 5

export default function useInfiniteProposals(filter: Partial<UseProposalsFilter> = {}) {
  const {
    data: proposals,
    isLoading: isLoadingProposals,
    isFetching: isFetchingProposals,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [`infinite-proposals#${JSON.stringify(filter)}`],
    queryFn: getProposalsQueryFn(filter, DEFAULT_ITEMS_PER_PAGE),
    staleTime: DEFAULT_QUERY_STALE_TIME,
    getNextPageParam: (lastPage, pages) => {
      const fetchedTotal = pages.reduce((acc, currentValue) => acc + currentValue.data.length, 0)
      return lastPage.total > fetchedTotal ? pages.length : undefined
    },
  })

  return {
    proposals: proposals?.pages,
    isLoadingProposals,
    isFetchingProposals,
    isFetchingNextPage,
    hasMoreProposals: !!hasNextPage,
    loadMore: fetchNextPage,
  }
}
