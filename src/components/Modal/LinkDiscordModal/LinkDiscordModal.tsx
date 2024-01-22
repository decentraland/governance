import { useEffect, useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { AccountType } from '../../../entities/User/types'
import { HIDE_LINK_DISCORD_MODAL_KEY } from '../../../front/localStorageKeys'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useIsDiscordLinked from '../../../hooks/useIsDiscordLinked'
import Text from '../../Common/Typography/Text'
import CircledDiscord from '../../Icon/CircledDiscord'
import LinkAccounts from '../../Icon/LinkAccounts'
import NotificationBellCircled from '../../Icon/NotificationBellCircled'
import AccountsConnectModal from '../IdentityConnectModal/AccountsConnectModal'

import './LinkDiscordModal.css'

const shouldShowModal = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HIDE_LINK_DISCORD_MODAL_KEY) !== 'true'
  }
  return true
}

export function LinkDiscordModal() {
  const [account] = useAuthContext()
  const { isDiscordLinked, isLoadingIsDiscordLinked } = useIsDiscordLinked()
  const t = useFormatMessage()

  const [isLinkDiscordModalOpen, setIsLinkDiscordModalOpen] = useState(false)
  const [isAccountsConnectModalOpen, setIsAccountsConnectModalOpen] = useState(false)

  useEffect(() => {
    setIsLinkDiscordModalOpen(!!account && shouldShowModal() && !isDiscordLinked && !isLoadingIsDiscordLinked)
  }, [account, isDiscordLinked, isLoadingIsDiscordLinked])

  const handleClose = () => {
    localStorage.setItem(HIDE_LINK_DISCORD_MODAL_KEY, 'true')
    setIsLinkDiscordModalOpen(false)
  }

  const handleLinkAccounts = () => {
    handleClose()
    setIsAccountsConnectModalOpen(true)
  }

  return (
    <>
      <Modal
        size="tiny"
        className={classNames('GovernanceActionModal', 'LinkDiscordModal')}
        closeIcon={<Close />}
        open={isLinkDiscordModalOpen}
        onClose={handleClose}
      >
        <Modal.Content>
          <div className="PostConnection__Icons">
            <NotificationBellCircled />
            <LinkAccounts />
            <CircledDiscord size={96} />
          </div>
          <div className="LinkDiscordModal__Content">
            <Header>{t('modal.link_discord.title')}</Header>
            <Text size="md" className="LinkDiscordModal__Description">
              {t('modal.link_discord.description')}
            </Text>
            <Text size="sm" color="secondary" className="LinkDiscordModal__Secondary">
              {t('modal.link_discord.sub')}
            </Text>
          </div>
          <div className="LinkDiscordModal__Action">
            <Button primary onClick={handleLinkAccounts}>
              {t('modal.link_discord.action')}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
      <AccountsConnectModal
        open={isAccountsConnectModalOpen}
        onClose={() => setIsAccountsConnectModalOpen(false)}
        account={AccountType.Discord}
      />
    </>
  )
}
