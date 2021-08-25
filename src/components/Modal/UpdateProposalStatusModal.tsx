import React, { useState, useMemo, useEffect } from 'react'
import { Modal, ModalProps} from 'decentraland-ui/dist/components/Modal/Modal'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalStatus } from '../../entities/Proposal/types'

import './ProposalModal.css'
import './UpdateProposalStatusModal.css'

export type UpdateProposalStatusModalProps = Omit<ModalProps, 'children'> & {
  status?: ProposalStatus | null,
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<any>, status: ProposalStatus, description: string) => void
}

export function UpdateProposalStatusModal({ onClickAccept, status, loading, open, ...props }: UpdateProposalStatusModalProps) {
  const l = useFormatMessage()
  const [ description, setDescription ] = useState('')
  useEffect(() => { setDescription('') }, [ status ])

  function handleAccept(e: React.MouseEvent<any>) {
    if (status && onClickAccept) {
      onClickAccept(e, status, description)
    }
  }

  const cta = useMemo(() => {
    switch(status) {
      case ProposalStatus.Enacted:
        return 'page.proposal_detail.enact'
        case ProposalStatus.Passed:
          return 'page.proposal_detail.pass'
      case ProposalStatus.Rejected:
        return 'page.proposal_detail.reject'
      default:
        return 'modal.update_status_proposal.accept'
    }
  }, [ status ])

  return <Modal {...props} open={open && !!status} size="small" className={TokenList.join(['ProposalModal', 'UpdateProposalStatusModal', props.className])} closeIcon={<Close />}>
    <Modal.Content className="ProposalModal__Title">
      <Header>{l('modal.update_status_proposal.title', { status })}</Header>
      <Markdown source={l('modal.update_status_proposal.description', { status }) || ''}/>
    </Modal.Content>
    <Modal.Content className="ProposalModal__Form">
      <MarkdownTextarea minHeight={150} value={description} onChange={(_: any, { value }: any) => setDescription(value)} />
    </Modal.Content>
    <Modal.Content className="ProposalModal__Actions">
      <Button primary onClick={handleAccept} loading={loading}>{l(cta)}</Button>
      <Button className="cancel" onClick={props.onClose}>{l('modal.update_status_proposal.reject')}</Button>
    </Modal.Content>
  </Modal>
}