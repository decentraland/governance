import React, { useState } from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { Survey, Topic } from '../../../../entities/SurveyTopic/types'
import { ProposalPageContext, SelectedChoice } from '../../../../pages/proposal'
import '../../ProposalModal.css'

import { SnapshotRedirect } from './SnapshotRedirect'
import './VotingModal.css'
import { VotingModalSurvey } from './VotingModalSurvey'

interface VotingModalProps {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  surveyTopics: Topic[] | null
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
  const [survey, setSurvey] = useState<Survey>([])
  const { selectedChoice, showSnapshotRedirect } = proposalContext

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
        onClose()
      }}
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
      {showSnapshotRedirect && <SnapshotRedirect proposal={proposal} />}
    </Modal>
  )
}
