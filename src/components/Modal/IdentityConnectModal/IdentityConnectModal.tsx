import React, { useEffect, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { Governance } from '../../../clients/Governance'
import Identity from '../../Icon/Identity'

import './IdentityConnectModal.css'

const INITIAL_VALUE = { forum_id: null }

function IdentityConnectModal() {
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const handleDismiss = () => setIsModalOpen(false)
  const handleConnect = () => {
    handleDismiss()
    setIsSetUpOpen(true)
  }
  const handleCloseSetUp = () => setIsSetUpOpen(false)

  const [response, responseState] = useAsyncMemo(
    async () => {
      if (user) {
        return await Governance.get().getForumId()
      }
      return INITIAL_VALUE
    },
    [user],
    {
      initialValue: { forum_id: null },
    }
  )

  useEffect(() => {
    if (!responseState.loading && response.forum_id !== null) {
      const { forum_id } = response
      // console.log('forum_id', response)
      setIsModalOpen(!forum_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseState.loading])

  return (
    <>
      <Modal open={isModalOpen} className="IdentityConnectModal" size="tiny">
        <Modal.Header>
          <Identity />
        </Modal.Header>
        <Modal.Content>
          <Markdown className="IdentityConnectModal__Description">{t('modal.identity_connect.description')}</Markdown>
          <div className="IdentityConnectModal__ButtonContainer">
            <Button fluid primary className="IdentityConnectModal__Button" onClick={handleConnect}>
              {t('modal.identity_connect.connect_button')}
            </Button>
            <Button fluid basic className="IdentityConnectModal__Button" onClick={handleDismiss}>
              {t('modal.identity_connect.cancel_button')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
      <Modal
        open={isSetUpOpen}
        className="IdentityConnectModal__SetUp"
        size="tiny"
        onClose={handleCloseSetUp}
        closeIcon={<Close />}
      >
        <Modal.Content>Hola</Modal.Content>
      </Modal>
    </>
  )
}

export default IdentityConnectModal
