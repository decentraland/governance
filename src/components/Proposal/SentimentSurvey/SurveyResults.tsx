import React from 'react'

import { Vote } from '../../../entities/Votes/types'

interface Props {
  votes: Record<string, Vote>
}

const SurveyResults = ({ votes }: Props) => {
  return <div>{Object.keys(votes!).map((key) => JSON.stringify(votes[key]))}</div>
}

export default SurveyResults
