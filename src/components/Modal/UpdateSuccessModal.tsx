import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { updateUrl } from '../../entities/Updates/utils'

import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function UpdateSuccessModal({ updateId, proposalId, ...props }: SuccessModalProps) {
  const t = useFormatMessage()
  const linkToCopy = updateUrl(updateId, proposalId)

  return (
    <SuccessModal
      title={t('modal.update_success.title')}
      description={t('modal.update_success.description')}
      linkToCopy={linkToCopy}
      {...props}
    />
  )
}
