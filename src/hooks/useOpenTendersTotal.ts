import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useOpenTendersTotal() {
  const { data } = useQuery({
    queryKey: [`openTendersTotal`],
    queryFn: () => Governance.get().getOpenTendersTotal(),
  })

  return {
    total: data?.total || 0,
  }
}
