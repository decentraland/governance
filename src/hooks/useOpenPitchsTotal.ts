import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useOpenPitchsTotal() {
  const { data } = useQuery({
    queryKey: [`openPitchsTotal`],
    queryFn: () => Governance.get().getOpenPitchsTotal(),
  })

  return {
    total: data?.total || 0,
  }
}
