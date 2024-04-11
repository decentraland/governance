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
  onCastVote: (selectedChoice: SelectedVoteChoice, survey?: Survey, reason?: string) => void
  onClose: () => void
  castingVote: boolean
  proposalPageState: ProposalPageState
  totalVpOnProposal: number
  shouldGiveReason?: boolean
  voteWithSurvey?: boolean
}

export function VotingModal({
  proposal,
  onClose,
  surveyTopics,
  isLoadingSurveyTopics,
  onCastVote,
  castingVote,
  proposalPageState,
  totalVpOnProposal,
  shouldGiveReason,
  voteWithSurvey,
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
          totalVpOnProposal={totalVpOnProposal}
          shouldGiveReason={shouldGiveReason}
          voteWithSurvey={voteWithSurvey}
        />
      )}
      {showSnapshotRedirect && <SnapshotRedirect proposal={proposal} />}
    </Modal>
  )
}
