import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

export default function useSurveyTopics(proposalId: string) {
  const [surveyTopics, state] = useAsyncMemo(async () => {
    return Governance.get().getSurveyTopics(proposalId)
  }, [])

  return {
    surveyTopics,
    isLoadingSurveyTopics: state.loading,
  }
}
