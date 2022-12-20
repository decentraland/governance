import React from 'react'

import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { Survey, Topic } from '../../../../entities/SurveyTopic/types'
import { SelectedVoteChoice } from '../../../../entities/Votes/types'
import { ProposalPageState } from '../../../../pages/proposal'
import '../../ProposalModal.css'

import { SnapshotRedirect } from './SnapshotRedirect'
import './VotingModal.css'
import { VotingModalSurvey } from './VotingModalSurvey'

interface VotingModalProps {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  surveyTopics: Topic[] | null
  isLoadingSurveyTopics: boolean
  onCastVote: (selectedChoice: SelectedVoteChoice, survey?: Survey) => void
  onClose: () => void
  castingVote: boolean
  proposalPageState: ProposalPageState
}

export function VotingModal({
  proposal,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalPageState,
}: VotingModalProps) {
  const { selectedChoice, showSnapshotRedirect } = proposalPageState

  if (!selectedChoice.choiceIndex || !selectedChoice.choice) {
    return null
  }

  return (
    <Modal
      size="tiny"
      className="VotingModal ProposalModal"
      open={proposalPageState.showVotingModal}
      closeIcon={<Close />}
      onClose={onClose}
    >
      {!showSnapshotRedirect && (
        <VotingModalSurvey
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          surveyTopics={surveyTopics}
          castingVote={castingVote}
          onCastVote={onCastVote}
          proposalPageState={proposalPageState}
        />
      )}
      {showSnapshotRedirect && <SnapshotRedirect proposal={proposal} />}
    </Modal>
  )
}
