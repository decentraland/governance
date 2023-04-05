import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

export default function useSurveyTopics(proposalId?: string) {
  const [surveyTopics, state] = useAsyncMemo(
    async () => {
      if (!proposalId || proposalId.length < 1) return []
      return Governance.get().getSurveyTopics(proposalId)
    },
    [proposalId],
    { callWithTruthyDeps: true }
  )

  return {
    surveyTopics,
    isLoadingSurveyTopics: state.loading,
  }
}
