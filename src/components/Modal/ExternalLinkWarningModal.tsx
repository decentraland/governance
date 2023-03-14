import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import './ExternalLinkWarningModal.css'

type Props = Omit<ModalProps, 'children'> & {
  onDismiss: (e: React.MouseEvent<unknown>) => void
  onContinue: (e: React.MouseEvent<unknown>) => void
}

function ExternalLinkWarningModal({ onDismiss, onContinue, open, ...props }: Props) {
  const t = useFormatMessage()
  return (
    <Modal {...props} open={open} size="tiny" closeIcon={<Close />} className={'ExternalLinkWarningModal'}>
      <Modal.Content>
        <div className={'ExternalLinkWarningModal__Title'}>
          <Header>{t('modal.external_link_warning.title')}</Header>
          <Paragraph>{t('modal.external_link_warning.description')}</Paragraph>
        </div>
        <div className={'ExternalLinkWarningModal__Actions'}>
          <Button fluid primary className={'ExternalLinkWarningModal__Button'} onClick={onContinue}>
            {t('modal.external_link_warning.accept')}
          </Button>
          <Button fluid basic className={'ExternalLinkWarningModal__Button'} onClick={onDismiss}>
            {t('modal.external_link_warning.reject')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default ExternalLinkWarningModal
