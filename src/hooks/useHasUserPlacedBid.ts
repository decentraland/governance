import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useHasUserPlacedBid(tenderId: string) {
  const { data: hasUserPlacedBid } = useQuery({
    queryKey: [`hasUserPlacedBid#${tenderId}`],
    queryFn: () => Governance.get().hasUserBidOnTender(tenderId),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  return hasUserPlacedBid ?? null
}

export default useHasUserPlacedBid
