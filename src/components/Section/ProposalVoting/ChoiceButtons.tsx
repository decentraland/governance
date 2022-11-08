import React, { useState } from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Survey } from '../../../entities/SurveyTopic/types'
import { Vote } from '../../../entities/Votes/types'
import { Scores } from '../../../entities/Votes/utils'

import ChoiceButton from './ChoiceButton'

type SelectableChoice = {
  currentChoice: string
  currentChoiceIndex: number
}

const EMPTY_SELECTION: SelectableChoice = { currentChoice: '', currentChoiceIndex: -1 }

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Scores
  totalVotes: number
  onVote: (choice: string, choiceIndex: number) => void
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
  const [selectedChoice, setSelectedChoice] = useState<SelectableChoice>(EMPTY_SELECTION)
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
            selected={selectedChoice.currentChoice === currentChoice}
            key={currentChoice}
            voted={votedCurrentChoice}
            disabled={votedCurrentChoice || !started}
            onClick={() => setSelectedChoice({ currentChoice, currentChoiceIndex })}
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
        disabled={!selectedChoice || !started}
        onClick={() =>
          onVote && selectedChoice && onVote(selectedChoice.currentChoice, selectedChoice.currentChoiceIndex + 1)
        }
      >
        {t('page.proposal_detail.cast_vote')}
      </Button>
    </>
  )
}
