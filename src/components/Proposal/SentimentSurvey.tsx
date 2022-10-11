import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useSurveyTopics from '../../hooks/useSurveyTopics'

interface Props {
  proposal: ProposalAttributes
}

// export type Reaction = {
//   id: string
//   name: string
//   icon: string
//   label_id: string
// }

const SentimentSurvey = ({ proposal }: Props) => {
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal.id)

  return (
    <div>
      <Loader active={isLoadingSurveyTopics} />
      {!isLoadingSurveyTopics && surveyTopics}
    </div>
  )
}

export default SentimentSurvey
