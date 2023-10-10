import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'
import '../ProposalModal.css'

export type VoteRegisteredModalProps = Omit<ModalProps, 'children'> & {
  loading?: boolean
  onClickAccept?: (e: React.MouseEvent<unknown>) => void
}

export function VoteRegisteredModal({ onClickAccept, loading, ...props }: VoteRegisteredModalProps) {
  const t = useFormatMessage()

  return (
    <Modal {...props} size="tiny" className="GovernanceActionModal ProposalModal" closeIcon={<Close />}>
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t('modal.vote_registered.title')}</Header>
          <Text size="lg">{t('modal.vote_registered.description')}</Text>
        </div>
        <div className="ProposalModal__Actions">
          <Button fluid primary onClick={onClickAccept} loading={loading}>
            {t('modal.vote_registered.accept')}
          </Button>
          <Button fluid className="cancel" onClick={props.onClose}>
            {t('modal.vote_registered.reject')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
