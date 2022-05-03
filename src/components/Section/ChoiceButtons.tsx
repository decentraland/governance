import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { Vote } from '../../entities/Votes/types'
import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Record<string, number>
  totalVotes: number
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  started: boolean
}

export const ChoiceButtons = ({ choices, vote, delegate, delegateVote, votesByChoices, totalVotes, onVote, started }: Props) => {
  const t = useFormatMessage()

  return (
    <>
      {choices.map((currentChoice, currentChoiceIndex) => {
        const votedCurrentChoice = vote?.choice === currentChoiceIndex + 1
        const delegateVotedCurrentChoice = delegateVote?.choice === currentChoiceIndex + 1
        return (
          <ChoiceButton
            key={currentChoice}
            voted={votedCurrentChoice}
            disabled={votedCurrentChoice || !started}
            onClick={(e: React.MouseEvent<any>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
            delegate={delegateVotedCurrentChoice ? delegate! : undefined}
            voteCount={votesByChoices[currentChoiceIndex]}
            totalVotes={totalVotes}
          >
            {t('page.proposal_detail.vote_choice', { choice: currentChoice })}
          </ChoiceButton>
        )
      })}
    </>
  )
}
