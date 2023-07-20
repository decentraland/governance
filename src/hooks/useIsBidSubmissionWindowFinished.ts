import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useIsBidSubmissionWindowFinished(tenderId: string) {
  const { data: isWindowFinished } = useQuery({
    queryKey: [`bidSubmissionWindow#${tenderId}`],
    queryFn: () => Governance.get().isBidSubmissionWindowFinished(tenderId),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  return !!isWindowFinished
}

export default useIsBidSubmissionWindowFinished
