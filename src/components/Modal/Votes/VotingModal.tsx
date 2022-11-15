import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'
import '../ProposalModal.css'

import { FeedbackReview } from './FeedbackReview'
import { SnapshotRedirect } from './SnapshotRedirect'
import './VotingModal.css'
import { VotingModalSurvey } from './VotingModalSurvey'

interface VotingModalProps {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  surveyTopics: Pick<SurveyTopicAttributes, 'label' | 'topic_id'>[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  proposalContext: ProposalPageContext
}

export function VotingModal({
  proposal,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalContext,
}: VotingModalProps) {
  const t = useFormatMessage()
  const [survey, setSurvey] = useState<Survey>([])
  const { selectedChoice, showSnapshotRedirect } = proposalContext
  const [showFeedbackReview, setShowFeedbackReview] = useState(false)

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal
      size="tiny"
      className="VotingModal ProposalModal"
      open={proposalContext.showVotingModal}
      closeIcon={<Close />}
      onClose={() => {
        setShowFeedbackReview(false)
        onClose()
      }}
    >
      {!showSnapshotRedirect && !showFeedbackReview && (
        <VotingModalSurvey
          survey={survey}
          setSurvey={setSurvey}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          surveyTopics={surveyTopics}
          castingVote={castingVote}
          onCastVote={onCastVote}
          proposalContext={proposalContext}
        />
      )}
      {showSnapshotRedirect && !showFeedbackReview && (
        <SnapshotRedirect proposal={proposal} onReviewFeedback={() => setShowFeedbackReview(true)} />
      )}
      {showFeedbackReview && (
        <FeedbackReview
          proposal={proposal}
          survey={survey}
          setSurvey={setSurvey}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          surveyTopics={surveyTopics}
        />
      )}
    </Modal>
  )
}
