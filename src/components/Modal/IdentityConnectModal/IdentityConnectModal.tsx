import { useEffect, useMemo, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import useFormatMessage from '../../../hooks/useFormatMessage'
import useIdentityModalContext from '../../../hooks/useIdentityModalContext'
import useIsProfileValidated from '../../../hooks/useIsProfileValidated'
import Markdown from '../../Common/Typography/Markdown'
import Identity from '../../Image/Identity'

import AccountsConnectModal from './AccountsConnectModal'
import './IdentityConnectModal.css'

const IDENTITY_MODAL_KEY = 'org.decentraland.governance.identity_modal.hide'
const HIDE_TIME = 24 * 60 * 60 * 1000 // 24hs

function IdentityConnectModal() {
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const { isModalOpen, setIsModalOpen } = useIdentityModalContext()
  const [isSetUpOpen, setIsSetUpOpen] = useState(false)
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const handleDismiss = () => {
    const timestamp = new Date(new Date().getTime() + HIDE_TIME).toISOString()
    localStorage.setItem(IDENTITY_MODAL_KEY, timestamp)
    setTimestamp(timestamp)
    setIsModalOpen(false)
  }
  const handleConnect = () => {
    setIsModalOpen(false)
    setIsSetUpOpen(true)
  }
  const handleCloseSetUp = () => {
    setIsSetUpOpen(false)
    handleDismiss()
  }

  const checkProfile = useMemo(() => !timestamp || new Date() > new Date(timestamp), [timestamp])
  const { isProfileValidated, validationChecked } = useIsProfileValidated(checkProfile ? user : null)

  useEffect(() => {
    if (!!setIsModalOpen && validationChecked) {
      setIsModalOpen(!isProfileValidated && !isSetUpOpen && checkProfile)
    }
  }, [checkProfile, isProfileValidated, isSetUpOpen, setIsModalOpen, validationChecked])

  useEffect(() => {
    setTimestamp(localStorage.getItem(IDENTITY_MODAL_KEY))
  }, [])

  return (
    <>
      <Modal open={isModalOpen} className="IdentityConnectModal" size="tiny">
        <Modal.Header>
          <Identity />
        </Modal.Header>
        <Modal.Content>
          <Markdown
            componentsClassNames={{ p: 'IdentityConnectModal__Text', strong: 'IdentityConnectModal__StrongText' }}
          >
            {t('modal.identity_connect.description')}
          </Markdown>
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
