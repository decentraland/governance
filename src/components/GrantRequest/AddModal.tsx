import React from 'react'

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
        {children}
        <div>
          <Button fluid primary onClick={onPrimaryClick} className="AddModal__PrimaryButton">
            {t('page.submit_grant.modal_actions.submit')}
          </Button>
          <Button fluid secondary onClick={onSecondaryClick || onClose} className="AddModal__SecondaryButton">
            {onSecondaryClick
              ? t('page.submit_grant.modal_actions.delete')
              : t('page.submit_grant.modal_actions.cancel')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default AddModal
