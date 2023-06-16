import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useSurveyTopics(proposalId?: string) {
  const { data: surveyTopics, isLoading: isLoadingSurveyTopics } = useQuery({
    queryKey: [`surveyTopics#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getSurveyTopics(proposalId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    surveyTopics: surveyTopics ?? null,
    isLoadingSurveyTopics,
  }
}
