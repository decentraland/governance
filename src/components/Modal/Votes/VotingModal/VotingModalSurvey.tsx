import { useMemo, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Reaction, Survey, Topic } from '../../../../entities/SurveyTopic/types'
import { SelectedVoteChoice } from '../../../../entities/Votes/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import { ProposalPageState } from '../../../../pages/proposal'
import { formatChoice } from '../../../../utils/votes/utils'
import Text from '../../../Common/Typography/Text'
import SentimentSurvey from '../../../Proposal/SentimentSurvey/SentimentSurvey'
import '../../ProposalModal.css'

import './VotingModal.css'

interface VotingModalSurveyProps {
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedVoteChoice, survey?: Survey) => void
  castingVote: boolean
  proposalPageState: ProposalPageState
}

export function VotingModalSurvey({
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalPageState,
}: VotingModalSurveyProps) {
  const [survey, setSurvey] = useState<Survey>([])
  const t = useFormatMessage()
  const { selectedChoice, showVotingError, retryTimer } = proposalPageState
  const reactionSelected = useMemo(
    () => survey.some((topicFeedback) => topicFeedback.reaction != Reaction.EMPTY),
    [survey]
  )

  return (
    <Modal.Content>
      <div className="ProposalModal__Title">
        <Header>{t('modal.voting_modal_survey.title')}</Header>
        <Text size="lg">
          {t('modal.voting_modal_survey.selected_choice')}
          <span className="VotingModal__Choice">{formatChoice(selectedChoice.choice!)}</span>
        </Text>
      </div>
      <SentimentSurvey
        survey={survey}
        surveyTopics={surveyTopics}
        isLoadingSurveyTopics={isLoadingSurveyTopics}
        setSurvey={setSurvey}
      />
      <div className="VotingModal__Actions">
        {!showVotingError && (
          <Button
            basic
            fluid
            onClick={() => onCastVote(selectedChoice)}
            disabled={castingVote || reactionSelected}
            className="VotingModal__SkipAndCast"
          >
            {t('page.proposal_detail.skip_and_cast_vote')}
          </Button>
        )}
        <div className={classNames('VotingModal__ErrorNotice', !showVotingError && 'VotingModal__ErrorNotice--hidden')}>
          {t('page.proposal_detail.voting_section.voting_failed')}
        </div>
        <Button
          fluid
          primary
          onClick={() => onCastVote(selectedChoice, survey)}
          loading={castingVote}
          disabled={showVotingError}
          className="VotingModal__CastVote"
        >
          {showVotingError
            ? t('page.proposal_detail.retry', { timer: retryTimer })
            : t('page.proposal_detail.cast_vote')}
        </Button>
      </div>
    </Modal.Content>
  )
}
