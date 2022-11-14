import React, { useState } from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { formatChoice } from '../../../modules/votes/utils'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'
import SentimentSurvey from '../../Proposal/SentimentSurvey/SentimentSurvey'
import '../ProposalModal.css'

import './VotingModal.css'

interface VotingModalProps {
  open: boolean
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  proposalContext: ProposalPageContext
}

export const SECONDS_FOR_VOTING_RETRY = 5

export function VotingModal({
  open,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalContext,
}: VotingModalProps) {
  const t = useFormatMessage()
  const [survey, setSurvey] = useState<Survey>([])
  const { selectedChoice, showVotingError, showSnapshotRedirect, retryTimer } = proposalContext

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal size="tiny" className="VotingModal ProposalModal" open={open} closeIcon={<Close />} onClose={onClose}>
      {!showSnapshotRedirect && (
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
              className={TokenList.join([
                'VotingModal__ErrorNotice',
                !showVotingError && 'VotingModal__ErrorNotice--hidden',
              ])}
            >
              {'Failed to cast vote'}
            </div>
            <Button
              fluid
              primary
              onClick={() => onCastVote(selectedChoice, survey)}
              loading={castingVote}
              disabled={showVotingError}
              className="VotingModal__CastVote"
            >
              {showVotingError ? `Retry in ${retryTimer}...` : t('page.proposal_detail.cast_vote')}
            </Button>
          </div>
        </Modal.Content>
      )}
      {showSnapshotRedirect && (
        <Modal.Content>
          <span>SNAPSHOT REDIRECT MOFO</span>
        </Modal.Content>
      )}
    </Modal>
  )
}
