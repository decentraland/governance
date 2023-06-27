import React from 'react'

import { getUpdateUrl } from '../../entities/Updates/utils'
import useFormatMessage from '../../hooks/useFormatMessage'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

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
