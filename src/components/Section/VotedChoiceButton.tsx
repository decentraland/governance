import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { ChoiceColor, Vote } from '../../entities/Votes/types'
import { calculateChoiceColor } from '../../entities/Votes/utils'
import ChoiceButton from './ChoiceButton'

const useVotedButtonProps = (
  vote: Vote | null,
  delegateVote: Vote | undefined,
  choices: string[]
): {
  color: ChoiceColor
  text: string
} => {
  const t = useFormatMessage()

  if (vote && delegateVote && vote.choice === delegateVote.choice) {
    return {
      color: calculateChoiceColor(choices[vote.choice - 1], vote.choice - 1),
      text: t('page.proposal_detail.both_voted_choice', { choice: choices[vote.choice - 1] }),
    }
  }

  if (vote) {
    return {
      color: calculateChoiceColor(choices[vote.choice - 1], vote.choice - 1),
      text: t('page.proposal_detail.voted_choice', { choice: choices[vote.choice - 1] }),
    }
  }

  if (delegateVote) {
    return {
      color: calculateChoiceColor(choices[delegateVote.choice - 1], delegateVote.choice - 1),
      text: t('page.proposal_detail.delegate_voted_choice', { choice: choices[delegateVote.choice - 1] }),
    }
  }

  return {
    color: 1,
    text: '',
  }
}

interface Props {
  vote: Vote | null
  delegateVote?: Vote
  choices: string[]
  votesByChoices: Record<string, number>
  totalVotes: number
}


const VotedChoiceButton = ({ vote, delegateVote, choices, votesByChoices, totalVotes }: Props) => {
  const props = useVotedButtonProps(vote, delegateVote, choices)

  return (
    <ChoiceButton disabled voted
                  voteCount={vote && votesByChoices[vote?.choice - 1] || 0}
                  partyTotalVotes={totalVotes}
                  {...props}>
      {props.text}
    </ChoiceButton>
  )
}

export default VotedChoiceButton
