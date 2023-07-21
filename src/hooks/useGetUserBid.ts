import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

function useGetUserBid(tenderId: string | null) {
  const { data: userBid } = useQuery({
    queryKey: [`userBid#${tenderId}`],
    queryFn: () => (tenderId ? Governance.get().getUserBidOnTender(tenderId) : null),
  })
  return userBid ?? null
}

export default useGetUserBid
