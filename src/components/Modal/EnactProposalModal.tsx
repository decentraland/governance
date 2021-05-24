import React, { useState } from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalModal.css'

export type EnactProposalModalProps = Omit<ModalProps, 'children'> & {
  enacting?: boolean
  onClickAccept?: (e: React.MouseEvent<any>, description: string) => void
}

export function EnactProposalModal({ onClickAccept, enacting, ...props }: EnactProposalModalProps) {
  const l = useFormatMessage()
  const [ description, setDescription ] = useState('')
  function handleAccept(e: React.MouseEvent<any>) {
    if (onClickAccept) {
      onClickAccept(e, description)
    }
  }

  return <Modal {...props} size="small" className={TokenList.join(['ProposalModal', props.className])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.enact_proposal.title')}</Header>
      <Paragraph small>{l('modal.enact_proposal.description')}</Paragraph>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Form">
      <MarkdownTextarea minHeight={150} value={description} onChange={(_: any, { value }: any) => setDescription(value)} />
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button primary onClick={handleAccept} loading={enacting}>{l('modal.enact_proposal.accept')}</Button>
      <Button className="cancel" onClick={props.onClose}>{l('modal.enact_proposal.reject')}</Button>
    </Modal.Content>
  </Modal>
}