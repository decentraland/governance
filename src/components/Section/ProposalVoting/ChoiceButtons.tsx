import React, { useEffect, useState } from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Vote } from '../../../entities/Votes/types'
import { Scores } from '../../../entities/Votes/utils'
import { ProposalPageOptions, SelectedChoice } from '../../../pages/proposal'
import { SECONDS_FOR_VOTING_RETRY } from '../../Modal/Votes/VotingModal'

import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Scores
  totalVotes: number
  onVote: (selectedChoice: SelectedChoice) => void
  selectedChoice: SelectedChoice
  castingVote: boolean
  patchOptions: (newState: Partial<ProposalPageOptions>) => void
  startAt?: Date
  showError: boolean
  onRetry: () => void
}

export const ChoiceButtons = ({
  choices,
  vote,
  delegate,
  delegateVote,
  votesByChoices,
  totalVotes,
  onVote,
  selectedChoice,
  castingVote,
  patchOptions,
  startAt,
  showError,
  onRetry,
}: Props) => {
  const t = useFormatMessage()
  const [timeLeft, setTimeLeft] = useState(SECONDS_FOR_VOTING_RETRY)

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)

      if (timeLeft === 0) {
        setTimeLeft(SECONDS_FOR_VOTING_RETRY)
        onRetry()
      }
      return () => clearTimeout(timer)
    }
  }, [showError, timeLeft, onRetry])

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
            selected={selectedChoice.choice === currentChoice}
            key={currentChoice}
            voted={votedCurrentChoice}
            disabled={votedCurrentChoice || !started}
            onClick={() => {
              patchOptions({ selectedChoice: { choice: currentChoice, choiceIndex: currentChoiceIndex + 1 } })
            }}
            delegate={delegateVotedCurrentChoice ? delegate! : undefined}
            voteCount={votesByChoices[currentChoiceIndex]}
            totalVotes={totalVotes}
          >
            {t('page.proposal_detail.vote_choice', { choice: currentChoice })}
          </ChoiceButton>
        )
      })}
      <Button
        primary
        disabled={!selectedChoice || !started || showError}
        loading={castingVote}
        onClick={() => onVote && selectedChoice && onVote(selectedChoice)}
      >
        {showError ? `Retry in ${timeLeft}...` : t('page.proposal_detail.cast_vote')}
      </Button>
    </>
  )
}
