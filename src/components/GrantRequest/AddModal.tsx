import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../hooks/useFormatMessage'

import './AddModal.css'

interface Props {
  title: string
  isOpen: boolean
  onPrimaryClick: () => void
  onSecondaryClick?: () => void
  onClose: () => void
  children: React.ReactNode
}

const AddModal = ({ title, isOpen, onClose, onSecondaryClick, onPrimaryClick, children }: Props) => {
  const t = useFormatMessage()

  return (
    <Modal
      onClose={onClose}
      size="small"
      closeIcon={<Close />}
      className="GovernanceContentModal AddModal"
      open={isOpen}
    >
      <Modal.Header className="AddModal__Title">{title}</Modal.Header>
      <Modal.Content>
        <form onSubmit={onPrimaryClick}>
          {children}
          <div>
            <Button fluid primary onClick={onPrimaryClick} className="AddModal__PrimaryButton">
              {t('page.submit_grant.modal_actions.submit')}
            </Button>
            <Button
              fluid
              secondary
              onClick={(e) => {
                e.preventDefault()
                if (onSecondaryClick) {
                  onSecondaryClick()
                } else {
                  onClose()
                }
              }}
              className="AddModal__SecondaryButton"
            >
              {onSecondaryClick
                ? t('page.submit_grant.modal_actions.delete')
                : t('page.submit_grant.modal_actions.cancel')}
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  )
}

export default AddModal
