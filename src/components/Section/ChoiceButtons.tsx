import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { Vote } from '../../entities/Votes/types'
import { calculateChoiceColor } from '../../entities/Votes/utils'
import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegateVote?: Vote
  votesByChoices: Record<string, number>
  totalVotes: number
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  started: boolean
}

export const ChoiceButtons = ({ choices, vote, delegateVote, votesByChoices, totalVotes, onVote, started }: Props) => {
  const t = useFormatMessage()

  return (
    <>
      {choices.map((currentChoice, currentChoiceIndex) => {
        return (
          <ChoiceButton
            key={currentChoice}
            voted={vote?.choice === currentChoiceIndex + 1 || delegateVote?.choice === currentChoiceIndex + 1}
            disabled={
              vote?.choice === currentChoiceIndex + 1 || delegateVote?.choice === currentChoiceIndex + 1 || !started
            }
            color={calculateChoiceColor(currentChoice, currentChoiceIndex)}
            onClick={(e: React.MouseEvent<any>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
            voteCount={votesByChoices[currentChoiceIndex]}
            partyTotalVotes={totalVotes}
          >
            {t('page.proposal_detail.vote_choice', { choice: currentChoice })}
          </ChoiceButton>
        )
      })}
    </>
  )
}
