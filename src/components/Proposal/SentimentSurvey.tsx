import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Loader } from 'decentraland-ui'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useSurveyTopics from '../../hooks/useSurveyTopics'

import './SentimentSurvey.css'
import SentimentSurveyRow from './SentimentSurveyRow'

interface Props {
  proposal: ProposalAttributes
}

const SentimentSurvey = ({ proposal }: Props) => {
  const t = useFormatMessage()
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal.id)

  return (
    <div className="SentimentSurvey">
      {isLoadingSurveyTopics && <Loader active={isLoadingSurveyTopics} />}
      {!isLoadingSurveyTopics && (
        <>
          <div className="SentimentSurvey__Header">
            <span>{'Topics'}</span>
            <span>{'Reaction'}</span>
          </div>
          {surveyTopics?.map((topic, index) => (
            <SentimentSurveyRow key={`SentimentSurveyRow_${index}`} topic={topic} />
          ))}
        </>
      )}
    </div>
  )
}

export default SentimentSurvey
