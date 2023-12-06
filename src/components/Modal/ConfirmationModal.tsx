import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import Heading from '../Common/Typography/Heading'
import Text from '../Common/Typography/Text'

import './ConfirmationModal.css'

interface Props {
  isOpen: boolean
  title: string
  description: React.ReactNode | string
  onClose: () => void
  onPrimaryClick: () => void
  onSecondaryClick: () => void
  primaryButtonText: string
  secondaryButtonText: string
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  onClose,
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonText,
  secondaryButtonText,
}: Props) {
  return (
    <Modal open={isOpen} size="tiny" closeIcon={<Close />} onClose={onClose}>
      <Modal.Content className="ConfirmationModal__Container">
        <div className="ConfirmationModal__Text">
          <Heading className="ConfirmationModal__Title" size="xs" weight="semi-bold">
            {title}
          </Heading>
          {typeof description === 'string' ? <Text>{description}</Text> : description}
        </div>
        <div className="ConfirmationModal__Actions">
          <Button fluid primary className="ConfirmationModal__Button" onClick={onPrimaryClick}>
            {primaryButtonText}
          </Button>
          <Button fluid basic className="ConfirmationModal__Button" onClick={onSecondaryClick}>
            {secondaryButtonText}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}
