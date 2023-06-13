import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useSurveyTopics(proposalId?: string) {
  const { data: surveyTopics, isLoading: isLoadingSurveyTopics } = useQuery({
    queryKey: [`surveyTopics#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getSurveyTopics(proposalId)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    surveyTopics: surveyTopics ?? null,
    isLoadingSurveyTopics,
  }
}
