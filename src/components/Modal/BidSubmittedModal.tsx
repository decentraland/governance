import React from 'react'

import { ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../hooks/useFormatMessage'

import ProposalPendingModal from './ProposalPendingModal'

export default function BidSubmittedModal(props: ModalProps) {
  const t = useFormatMessage()

  return (
    <ProposalPendingModal
      title={t(`modal.proposal_pending.bid_title`)}
      description={t(`modal.proposal_pending.bid_description`)}
      helper={t(`modal.proposal_pending.bid_helper`)}
      {...props}
    />
  )
}
