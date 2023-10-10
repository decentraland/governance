import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'
import '../ProposalModal.css'

export type DeleteProposalModalProps = Omit<ModalProps, 'children'> & {
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<unknown>) => void
}

export function DeleteProposalModal({ onClickAccept, loading, ...props }: DeleteProposalModalProps) {
  const t = useFormatMessage()

  return (
    <Modal
      {...props}
      size="tiny"
      className={classNames('GovernanceActionModal', 'ProposalModal', props.className)}
      closeIcon={<Close />}
    >
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t('modal.delete_proposal.title')}</Header>
          <Text size="lg">{t('modal.delete_proposal.description')}</Text>
        </div>
        <div>
          <Button fluid primary onClick={onClickAccept} loading={loading}>
            {t('modal.delete_proposal.accept')}
          </Button>
          <Button fluid className="cancel" onClick={props.onClose}>
            {t('modal.delete_proposal.reject')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
