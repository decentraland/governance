import React, { useCallback, useEffect, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Governance } from '../../../clients/Governance'
import Identity from '../../Icon/Identity'

import './IdentityConnectModal.css'

function IdentityConnectModal() {
  const t = useFormatMessage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleDismiss = useCallback(() => setIsModalOpen(false), [])

  const [response, responseState] = useAsyncMemo(() => Governance.get().getForumId(), [], {
    initialValue: { forum_id: null },
  })

  useEffect(() => {
    if (!responseState.loading && response.forum_id !== null) {
      const { forum_id } = response
      console.log('forum_id', response)
      setIsModalOpen(!forum_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseState.loading])

  return (
    <Modal
      open={isModalOpen}
      className="IdentityConnectModal"
      size="tiny"
      closeIcon={<Close />}
      onClose={handleDismiss}
    >
      <Modal.Header>
        <Identity />
      </Modal.Header>
      <Modal.Content>
        <Markdown className="IdentityConnectModal__Description">{t('modal.identity_connect.description')}</Markdown>
        <div className="IdentityConnectModal__ButtonContainer">
          <Button fluid primary className="IdentityConnectModal__Button">
            {t('modal.identity_connect.connect_button')}
          </Button>
          <Button fluid basic className="IdentityConnectModal__Button">
            {t('modal.identity_connect.cancel_button')}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default IdentityConnectModal
