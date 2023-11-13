import { ProposalAttributes } from '../entities/Proposal/types'
import { VoteByAddress } from '../entities/Votes/types'

import useSurveyTopics from './useSurveyTopics'

const SURVEY_FEATURE_LAUNCH = new Date(2023, 3, 5, 0, 0)

export default function useSurvey(
  proposal?: ProposalAttributes | null,
  votes?: VoteByAddress | null,
  isLoadingVotes?: boolean,
  isMobile?: boolean
) {
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal?.id)
  const voteWithSurvey =
    !isLoadingSurveyTopics &&
    !!surveyTopics &&
    surveyTopics.length > 0 &&
    !!proposal &&
    proposal.created_at > SURVEY_FEATURE_LAUNCH
  const hasVotes = votes && Object.keys(votes).length > 0 && !isLoadingVotes
  const hasSurveyTopics = surveyTopics && surveyTopics?.length > 0 && !isLoadingSurveyTopics
  const showSurveyResults = proposal && voteWithSurvey && !isMobile && hasVotes && hasSurveyTopics
  return { surveyTopics, isLoadingSurveyTopics, voteWithSurvey, showSurveyResults }
}
