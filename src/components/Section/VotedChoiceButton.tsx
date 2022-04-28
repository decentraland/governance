import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { VotedChoice } from '../../entities/Votes/utils'
import ChoiceButton from './ChoiceButton'

const VotedChoiceButton = ({ id, values, delegate, totalVotes, voteCount }: VotedChoice) => {
  const t = useFormatMessage()
  const text = t(id,values)
  return (
    <ChoiceButton voted voteCount={voteCount} totalVotes={totalVotes} delegate={delegate}>
      {text}
    </ChoiceButton>
  )
}

export default VotedChoiceButton
