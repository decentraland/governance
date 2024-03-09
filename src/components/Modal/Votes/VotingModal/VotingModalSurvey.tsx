import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Survey, Topic } from '../../../../entities/SurveyTopic/types'
import { Reason, SelectedVoteChoice } from '../../../../entities/Votes/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import useTimer from '../../../../hooks/useTimer'
import { ProposalPageState } from '../../../../pages/proposal'
import { formatChoice } from '../../../../utils/votes/utils'
import Text from '../../../Common/Typography/Text'
import SentimentSurvey from '../../../Proposal/SentimentSurvey/SentimentSurvey'
import '../../ProposalModal.css'

import ReasonVoteArea from './ReasonVoteArea'
import './VotingModal.css'

const REASON_TIMER_SECONDS = 5

interface VotingModalSurveyProps {
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedVoteChoice, survey?: Survey, reason?: string) => void
  castingVote: boolean
  proposalPageState: ProposalPageState
  totalVpOnProposal: number
  shouldGiveReason?: boolean
  voteWithSurvey?: boolean
}

export function VotingModalSurvey({
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalPageState,
  totalVpOnProposal,
  shouldGiveReason = false,
  voteWithSurvey,
}: VotingModalSurveyProps) {
  const [survey, setSurvey] = useState<Survey>([])
  const t = useFormatMessage()
  const { selectedChoice, showVotingError, retryTimer } = proposalPageState

  const { startTimer, time } = useTimer(REASON_TIMER_SECONDS)

  const { formatNumber } = useIntl()

  const {
    formState: { errors },
    control,
    watch,
  } = useForm<Reason>({ defaultValues: { reason: '' }, mode: 'onTouched' })

  const isCastDisabled = (shouldGiveReason && (!!errors.reason || time > 0)) || showVotingError

  useEffect(() => {
    if (shouldGiveReason) {
      startTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldGiveReason])

  const choice = formatChoice(selectedChoice.choice!)
  const timerDisplay = shouldGiveReason && time > 0 ? ` (${time})` : ''

  return (
    <Modal.Content>
      <div className="ProposalModal__Title">
        <Header>{t('modal.voting_modal_survey.title')}</Header>
        <Text size="lg">
          {t('modal.voting_modal_survey.selected_choice', { choice })}
          <span className="VotingModal__VoteVp">{formatNumber(totalVpOnProposal)} VP</span>
        </Text>
      </div>
      <div className="VotingModal__Content">
        {shouldGiveReason && (
          <ReasonVoteArea control={control} errors={errors} watch={watch} isDisabled={castingVote} choice={choice} />
        )}
        {voteWithSurvey && (
          <SentimentSurvey
            survey={survey}
            surveyTopics={surveyTopics}
            isLoadingSurveyTopics={isLoadingSurveyTopics}
            setSurvey={setSurvey}
          />
        )}
      </div>
      <div className="VotingModal__Actions">
        <Button
          fluid
          primary
          onClick={() => onCastVote(selectedChoice, survey, watch('reason'))}
          loading={castingVote}
          disabled={isCastDisabled}
          className="VotingModal__CastVote"
        >
          {showVotingError
            ? t('page.proposal_detail.retry', { timer: retryTimer })
            : t('page.proposal_detail.cast_vote') + timerDisplay}
        </Button>
      </div>
      <div className={classNames('VotingModal__ErrorNotice', !showVotingError && 'VotingModal__ErrorNotice--hidden')}>
        {t('page.proposal_detail.voting_section.voting_failed')}
      </div>
    </Modal.Content>
  )
}
