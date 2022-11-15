import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Survey, SurveyTopicAttributes } from '../../../entities/SurveyTopic/types'
import { ProposalPageContext, SelectedChoice } from '../../../pages/proposal'
import '../ProposalModal.css'

import { VoteOnSnapshot } from './VoteOnSnapshot'
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
  const { selectedChoice, showVotingError, showSnapshotRedirect, retryTimer } = proposalContext
  // const showFeedbackReview = true

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal
      size="tiny"
      className="VotingModal ProposalModal"
      open={proposalContext.showVotingModal}
      closeIcon={<Close />}
      onClose={onClose}
    >
      {!showSnapshotRedirect && (
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
      {showSnapshotRedirect && <VoteOnSnapshot proposal={proposal} />}
      {/*{showFeedbackReview && (*/}

      {/*)}*/}
    </Modal>
  )
}
