import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { SuccessModal, SuccessModalProps } from './SuccessModal'
import { getUpdateUrl } from '../../entities/Proposal/utils'

export default function UpdateSuccessModal({ updateId, proposalId, ...props }: SuccessModalProps) {
  const t = useFormatMessage()
  const linkToCopy = getUpdateUrl(updateId, proposalId)

  return (
    <SuccessModal
      title={t('modal.update_success.title')}
      description={t('modal.update_success.description')}
      linkToCopy={linkToCopy}
      {...props}
    />
  )
}
