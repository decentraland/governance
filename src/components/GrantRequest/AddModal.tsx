import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import './AddModal.css'

interface Props {
  title: string
  isOpen: boolean
  onPrimaryClick: () => void
  onClose: () => void
  children: React.ReactNode
}

const AddModal = ({ title, isOpen, onClose, onPrimaryClick, children }: Props) => {
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
          <Button fluid primary onClick={onPrimaryClick}>
            {t('page.submit_grant.modal_actions.submit')}
          </Button>
          <Button fluid secondary onClick={onClose} className="AddModal__SecondaryButton">
            {t('page.submit_grant.modal_actions.cancel')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default AddModal
