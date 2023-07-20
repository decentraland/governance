import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

function useIsBidSubmissionWindowFinished(tenderId: string | null) {
  const { data: isWindowFinished } = useQuery({
    queryKey: [`bidSubmissionWindow#${tenderId}`],
    queryFn: () => (tenderId ? Governance.get().isBidSubmissionWindowFinished(tenderId) : null),
  })
  return !!isWindowFinished
}

export default useIsBidSubmissionWindowFinished
