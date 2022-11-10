import React, { useEffect, useState } from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { formatChoice } from '../../../modules/votes/utils'
import { SelectedChoice } from '../../../pages/proposal'
import SentimentSurvey from '../../Proposal/SentimentSurvey/SentimentSurvey'
import '../ProposalModal.css'

import './VotingModal.css'

interface VotingModalProps {
  open: boolean
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  selectedChoice: SelectedChoice
  onCastVote: (selectedChoice: SelectedChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  showError: boolean
  onRetry: () => void
}

export const SECONDS_FOR_VOTING_RETRY = 5

export function VotingModal({
  open,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  selectedChoice,
  onCastVote,
  castingVote,
  showError,
  onRetry,
}: VotingModalProps) {
  const t = useFormatMessage()
  const [survey, setSurvey] = useState<Survey>([])
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

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal size="tiny" className="VotingModal ProposalModal" open={open} closeIcon={<Close />} onClose={onClose}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{"We'd appreciate some extra feedback"}</Header>
          <Paragraph small>{`You're about to vote "${formatChoice(selectedChoice.choice)}"`}</Paragraph>
        </div>
        <SentimentSurvey
          surveyTopics={surveyTopics}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          setSurvey={setSurvey}
        />
        <div className="VotingModal__Actions">
          <div
            className={TokenList.join(['VotingModal__ErrorNotice', !showError && 'VotingModal__ErrorNotice--hidden'])}
          >
            {'Vote Failed'}
          </div>
          <Button
            fluid
            primary
            onClick={() => onCastVote(selectedChoice, survey)}
            loading={castingVote}
            disabled={showError}
            className="VotingModal__CastVote"
          >
            {showError ? `Retry in ${timeLeft}...` : t('page.proposal_detail.cast_vote')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
