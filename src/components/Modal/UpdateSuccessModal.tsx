import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { SuccessModal, SuccessModalProps } from './SuccessModal'
import { getUpdateUrl } from '../../entities/Proposal/utils'

export default function UpdateSuccessModal({ updateId, proposalId, ...props }: SuccessModalProps) {
  const l = useFormatMessage()
  const linkToCopy = getUpdateUrl(updateId, proposalId)

  return (
    <SuccessModal
      title={l('modal.update_success.title')}
      description={l('modal.update_success.description')}
      linkToCopy={linkToCopy}
      {...props}
    />
  )
}
