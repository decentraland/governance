import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

function useGetPlacedBid(tenderId: string | null) {
  const { data: hasUserPlacedBid } = useQuery({
    queryKey: [`hasUserPlacedBid#${tenderId}`],
    queryFn: () => (tenderId ? Governance.get().getUserBidOnTender(tenderId) : null),
  })
  return hasUserPlacedBid ?? null
}

export default useGetPlacedBid
