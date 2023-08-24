import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useOpenPitchesTotal() {
  const { data } = useQuery({
    queryKey: [`openPitchesTotal`],
    queryFn: () => Governance.get().getOpenPitchesTotal(),
  })

  return {
    total: data?.total || 0,
  }
}
