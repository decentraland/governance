import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

export default function useSurveyTopics(proposalId?: string | null) {
  const [surveyTopics, state] = useAsyncMemo(async () => {
    if (!proposalId || proposalId.length < 1) return []
    return Governance.get().getSurveyTopics(proposalId)
  }, [])

  return {
    surveyTopics,
    isLoadingSurveyTopics: state.loading,
  }
}
