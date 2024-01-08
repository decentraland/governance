import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useIsDiscordConnected() {
  const [user] = useAuthContext()
  const { data, refetch } = useQuery({
    queryKey: [`isDiscordConnected`, user],
    queryFn: () => Governance.get().isDiscordConnected(),
    enabled: !!user,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    isDiscordConnected: !!data,
    refetch,
  }
}

export default useIsDiscordConnected
