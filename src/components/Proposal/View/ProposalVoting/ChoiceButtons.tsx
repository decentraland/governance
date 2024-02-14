import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { SelectedVoteChoice, Vote } from '../../../../entities/Votes/types'
import { Scores } from '../../../../entities/Votes/utils'
import useCountdown from '../../../../hooks/useCountdown'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import { ProposalPageState } from '../../../../pages/proposal'
import Time from '../../../../utils/date/Time'

import ChoiceButton from './ChoiceButton'

interface Props {
  choices: string[]
  vote: Vote | null
  delegate?: string | null
  delegateVote?: Vote | null
  votesByChoices: Scores
  totalVotes: number
  onVote: (selectedChoice: SelectedVoteChoice) => void
  voteWithSurvey: boolean
  castingVote: boolean
  proposalPageState: ProposalPageState
  updatePageState: React.Dispatch<React.SetStateAction<ProposalPageState>>
  startAt?: Date
}

function getSelectedChoice(currentChoice: string, currentChoiceIndex: number) {
  return { choice: currentChoice, choiceIndex: currentChoiceIndex + 1 }
}

export const ChoiceButtons = ({
  choices,
  vote,
  delegate,
  delegateVote,
  votesByChoices,
  totalVotes,
  onVote,
  voteWithSurvey,
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
    if (voteWithSurvey) {
      return () => onVote(getSelectedChoice(currentChoice, currentChoiceIndex))
    } else {
      return () => {
        updatePageState((prevState) => ({
          ...prevState,
          selectedChoice: getSelectedChoice(currentChoice, currentChoiceIndex),
        }))
      }
    }
  }

  return (
    <>
      {choices.map((currentChoice, currentChoiceIndex) => {
        const votedCurrentChoice = vote?.choice === currentChoiceIndex + 1
        const delegateVotedCurrentChoice = delegateVote?.choice === currentChoiceIndex + 1
        return (
          <ChoiceButton
            selected={selectedChoice.choice === currentChoice && !voteWithSurvey}
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
        disabled={selectionPending || !started || showVotingError || voteWithSurvey}
        loading={castingVote}
        onClick={() => onVote && selectedChoice && onVote(selectedChoice)}
      >
        {showVotingError ? t('page.proposal_detail.retry', { timer: retryTimer }) : t('page.proposal_detail.cast_vote')}
      </Button>
    </>
  )
}
