import React from 'react'

import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Vote } from '../../../entities/Votes/types'
import useSurveyTopics from '../../../hooks/useSurveyTopics'
import Divider from '../../Common/Divider'

import './SurveyResults.css'
import SurveyTopicResult from './SurveyTopicResult'

interface Props {
  votes: Record<string, Vote>
  proposalId: string
}

const SurveyResults = ({ votes, proposalId }: Props) => {
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposalId)
  // const results = Object.keys(votes!).map((key) => JSON.stringify(votes[key]))

  return (
    <div className="SurveyResults">
      <Divider />
      {isLoadingSurveyTopics && <Loader />}
      {!isLoadingSurveyTopics && (
        <div>
          <div className="SurveyResults__Header">
            <Header>Voter Sentiment</Header>
          </div>
          {surveyTopics?.map((topic, index) => {
            return <SurveyTopicResult topic={topic} key={`SurveyTopicResult__${index}`} />
          })}
        </div>
      )}
    </div>
  )
}

export default SurveyResults
