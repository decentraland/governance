import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function ProposalSuccessModal(props: SuccessModalProps) {
  const l = useFormatMessage()

  return (
    <SuccessModal
      title={l('modal.proposal_success.title')}
      description={l('modal.proposal_success.description')}
      {...props}
    />
  )
}
