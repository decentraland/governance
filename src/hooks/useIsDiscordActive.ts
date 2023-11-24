import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useIsDiscordActive() {
  const [user] = useAuthContext()
  const { data, refetch } = useQuery({
    queryKey: [`isDiscordActive`, user],
    queryFn: () => Governance.get().isDiscordActive(),
    enabled: !!user,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    isDiscordActive: !!data,
    refetch,
  }
}

export default useIsDiscordActive
