import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import '../ProposalModal.css'

export type DeleteProposalModalProps = Omit<ModalProps, 'children'> & {
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<unknown>) => void
}

export function DeleteProposalModal({ onClickAccept, loading, ...props }: DeleteProposalModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', props.className])} closeIcon={<Close />}>
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('modal.delete_proposal.title')}</Header>
        <Paragraph small>{t('modal.delete_proposal.description')}</Paragraph>
      </Modal.Content>
      <Modal.Content className="ProposalModal__Actions">
        <Button primary onClick={onClickAccept} loading={loading}>
          {t('modal.delete_proposal.accept')}
        </Button>
        <Button className="cancel" onClick={props.onClose}>
          {t('modal.delete_proposal.reject')}
        </Button>
      </Modal.Content>
    </Modal>
  )
}
