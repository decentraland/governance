import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useIsDiscordLinked() {
  const [user] = useAuthContext()
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`isDiscordLinked`, user],
    queryFn: () => Governance.get().isDiscordLinked(),
    enabled: !!user,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    isDiscordLinked: !!data,
    isLoadingIsDiscordLinked: isLoading,
    refetch,
  }
}

export default useIsDiscordLinked
