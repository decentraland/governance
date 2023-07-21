import React, { useEffect } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalType } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposals from '../../../hooks/useProposals'
import { ProposalPageState } from '../../../pages/proposal'
import Markdown from '../../Common/Typography/Markdown'
import ProposalCard from '../../Proposal/View/ProposalCard'
import '../ProposalModal.css'

import './BidVotingModal.css'

type Props = Omit<ModalProps, 'children'> & {
  proposalPageState: ProposalPageState
  linkedTenderId: string
}

function BidVotingModal({ onVote, linkedTenderId, proposalPageState, ...props }: Props) {
  const t = useFormatMessage()
  const { proposals } = useProposals({
    type: ProposalType.Bid,
    linkedProposalId: linkedTenderId,
    order: 'ASC',
  })
  const { selectedChoice, showBidVotingModal } = proposalPageState
  useEffect(() => {
    console.log(proposals)
  }, [proposals])

  return (
    <Modal
      size="small"
      className="BidVotingModal ProposalModal"
      open={showBidVotingModal}
      closeIcon={<Close />}
      {...props}
    >
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t('modal.bid_voting.title')}</Header>
          <Markdown className="BidVotingModal__Description">
            {t('modal.bid_voting.description', { amount: proposals?.total })}
          </Markdown>
        </div>
        {proposals?.data.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} showBudget />
        ))}
      </Modal.Content>
      <Modal.Actions className="BidVotingModal__ActionContainer">
        <Button className="BidVotingModal__Action" basic onClick={onVote}>
          {t('modal.bid_voting.action', { vote: selectedChoice.choice! })}
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

export default BidVotingModal
