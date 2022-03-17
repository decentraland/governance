import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { SuccessModal, SuccessModalProps } from './SuccessModal'

export default function UpdateSuccessModal(props: SuccessModalProps) {
  const l = useFormatMessage()

  return (
    <SuccessModal
      title={l('modal.update_success.title')}
      description={l('modal.update_success.description')}
      showCopyLinkButton={false}
      {...props}
    />
  )
}
