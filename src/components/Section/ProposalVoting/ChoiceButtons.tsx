import React from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { Vote } from '../../../entities/Votes/types'
import { Scores } from '../../../entities/Votes/utils'

import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Scores
  totalVotes: number
  onVote: (e: React.MouseEvent<unknown>, choice: string, choiceIndex: number) => void
  startAt?: Date
}

export const ChoiceButtons = ({
  choices,
  vote,
  delegate,
  delegateVote,
  votesByChoices,
  totalVotes,
  onVote,
  startAt,
}: Props) => {
  const t = useFormatMessage()
  const now = Time.utc()
  const untilStart = useCountdown(Time.utc(startAt) || now)
  const started = untilStart.time === 0
  return (
    <>
      {choices.map((currentChoice, currentChoiceIndex) => {
        const votedCurrentChoice = vote?.choice === currentChoiceIndex + 1
        const delegateVotedCurrentChoice = delegateVote?.choice === currentChoiceIndex + 1
        return (
          <ChoiceButton
            selected={false}
            key={currentChoice}
            voted={votedCurrentChoice}
            disabled={votedCurrentChoice || !started}
            onClick={(e: React.MouseEvent<unknown>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
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
