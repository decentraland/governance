import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

function useBidsInfoOnTender(tenderId?: string | null) {
  const { data } = useQuery({
    queryKey: [`bidsInfo#${tenderId}`],
    queryFn: () => (tenderId ? Governance.get().getBidsInfoOnTender(tenderId) : null),
  })

  return {
    isSubmissionWindowFinished: data?.is_submission_window_finished,
    publishAt: data?.publish_at,
  }
}

export default useBidsInfoOnTender
