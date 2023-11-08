import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes, ProposalType, SortingOrder } from '../../../entities/Proposal/types'
import { SelectedVoteChoice } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposals from '../../../hooks/useProposals'
import { ProposalPageState } from '../../../pages/proposal'
import Markdown from '../../Common/Typography/Markdown'
import ProposalCard from '../../Proposal/View/ProposalCard'
import '../ProposalModal.css'
import { SnapshotRedirect } from '../Votes/VotingModal/SnapshotRedirect'

import './BidVotingModal.css'

type Props = Omit<ModalProps, 'children'> & {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
  proposalPageState: ProposalPageState
  linkedTenderId: string
  onCastVote: (selectedChoice: SelectedVoteChoice) => void
  castingVote: boolean
}

function BidVotingModal({ onCastVote, castingVote, linkedTenderId, proposalPageState, proposal, ...props }: Props) {
  const t = useFormatMessage()
  const { proposals } = useProposals({
    type: ProposalType.Bid,
    linkedProposalId: linkedTenderId,
    order: SortingOrder.ASC,
  })
  const { selectedChoice, showBidVotingModal, showVotingError, retryTimer, showSnapshotRedirect } = proposalPageState
  const { snapshot_id: currentProposal } = proposal

  return (
    <Modal
      size="tiny"
      className="BidVotingModal ProposalModal"
      open={showBidVotingModal}
      closeIcon={<Close />}
      {...props}
    >
      {!showSnapshotRedirect && (
        <>
          <Modal.Content>
            <div className="ProposalModal__Title">
              <Header>{t('modal.bid_voting.title')}</Header>
              <Markdown componentsClassNames={{ p: 'BidVotingModal__Description' }}>
                {t('modal.bid_voting.description', { amount: proposals?.total })}
              </Markdown>
            </div>
            {proposals?.data.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                showBudget
                isDisabled={proposal.snapshot_id === currentProposal}
                hideUser
                showLeadingVP
                hideEndDate
              />
            ))}
          </Modal.Content>
          <Modal.Actions className="BidVotingModal__ActionContainer">
            <Button
              className="BidVotingModal__Action"
              basic
              onClick={() => onCastVote(selectedChoice)}
              loading={castingVote}
              disabled={showVotingError}
            >
              {showVotingError
                ? t('page.proposal_detail.retry', { timer: retryTimer })
                : t('modal.bid_voting.action', { vote: selectedChoice.choice! })}
            </Button>
          </Modal.Actions>
        </>
      )}
      {showSnapshotRedirect && <SnapshotRedirect proposal={proposal} />}
    </Modal>
  )
}

export default BidVotingModal
