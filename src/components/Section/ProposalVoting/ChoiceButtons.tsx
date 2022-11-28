import React, { useEffect, useState } from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Vote } from '../../../entities/Votes/types'
import { Scores } from '../../../entities/Votes/utils'
import { ProposalPageState, SelectedChoice } from '../../../pages/proposal'

import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Scores
  totalVotes: number
  onVote: (selectedChoice: SelectedChoice) => void
  castingVote: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
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
  castingVote,
  proposalPageState,
  updatePageState,
  startAt,
}: Props) => {
  const t = useFormatMessage()
  const { selectedChoice, retryTimer, showVotingError } = proposalPageState
  const now = Time.utc()
  const untilStart = useCountdown(Time.utc(startAt) || now)
  const started = untilStart.time === 0
  const selectionPending = !(selectedChoice && !!selectedChoice.choice)

  const handleChoiceClick = (currentChoice: string, currentChoiceIndex: number) => {
    return () => {
      updatePageState({ selectedChoice: { choice: currentChoice, choiceIndex: currentChoiceIndex + 1 } })
    }
  }

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
            onClick={handleChoiceClick(currentChoice, currentChoiceIndex)}
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
        disabled={selectionPending || !started || showVotingError}
        loading={castingVote}
        onClick={() => onVote && selectedChoice && onVote(selectedChoice)}
      >
        {showVotingError ? t('page.proposal_detail.retry', { timer: retryTimer }) : t('page.proposal_detail.cast_vote')}
      </Button>
    </>
  )
}
