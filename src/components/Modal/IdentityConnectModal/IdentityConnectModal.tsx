import React, { useEffect, useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useIdentityModalContext from '../../../hooks/useIdentityModalContext'
import useIsProfileValidated from '../../../hooks/useIsProfileValidated'
import Identity from '../../Icon/Identity'

import AccountsConnectModal from './AccountsConnectModal'
import './IdentityConnectModal.css'

const STORAGE_KEY = 'org.decentraland.governance.identity_modal.hide'
const HIDE_TIME = 24 * 60 * 60 * 1000 // 24hs

function IdentityConnectModal() {
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const { isModalOpen, setIsModalOpen } = useIdentityModalContext()
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, new Date(new Date().getTime() + HIDE_TIME).toISOString())
    setIsModalOpen(false)
  }
  const handleConnect = () => {
    setIsModalOpen(false)
    setIsSetUpOpen(true)
  }
  const handleCloseSetUp = () => setIsSetUpOpen(false)

  const timestamp = localStorage.getItem(STORAGE_KEY)
  const checkProfile = !timestamp || new Date() > new Date(timestamp)
  const isProfileValidated = useIsProfileValidated(checkProfile ? user : null)

  useEffect(() => {
    if (!!setIsModalOpen && isProfileValidated !== null) {
      setIsModalOpen(!isProfileValidated)
    }
  }, [isProfileValidated, setIsModalOpen])

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
      <AccountsConnectModal open={isSetUpOpen} onClose={handleCloseSetUp} />
    </>
  )
}

export default IdentityConnectModal
