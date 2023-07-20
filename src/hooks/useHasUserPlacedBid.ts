import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

function useHasUserPlacedBid(tenderId: string | null) {
  const { data: hasUserPlacedBid } = useQuery({
    queryKey: [`hasUserPlacedBid#${tenderId}`],
    queryFn: () => (tenderId ? Governance.get().hasUserBidOnTender(tenderId) : null),
  })
  return hasUserPlacedBid ?? null
}

export default useHasUserPlacedBid
