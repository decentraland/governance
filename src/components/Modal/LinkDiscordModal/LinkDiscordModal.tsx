import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import { z } from 'zod'

import { AccountType } from '../../../entities/User/types'
import { SHOW_DISCORD_MODAL_KEY } from '../../../front/localStorageKeys'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useIsDiscordLinked from '../../../hooks/useIsDiscordLinked'
import useIsProfileValidated from '../../../hooks/useIsProfileValidated'
import Time from '../../../utils/date/Time'
import AccountLinkToast from '../../AccountLinkToast/AccountLinkToast'
import Text from '../../Common/Typography/Text'
import CircledDiscord from '../../Icon/CircledDiscord'
import LinkAccounts from '../../Icon/LinkAccounts'
import NotificationBellCircled from '../../Icon/NotificationBellCircled'
import AccountsConnectModal from '../IdentityConnectModal/AccountsConnectModal'

import './LinkDiscordModal.css'

const noticeCountSchema = z.object({
  lastDisplayTime: z.number(),
  count: z.number(),
})

type NoticeCount = z.infer<typeof noticeCountSchema>

const getDaysDifference = (date1: Date, date2: Date) => Time(date1).diff(date2, 'days')

export function LinkDiscordModal() {
  const [account] = useAuthContext()
  const { isDiscordLinked, isLoadingIsDiscordLinked } = useIsDiscordLinked()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(account) // TODO: use Discord & Push
  const t = useFormatMessage()

  const [isLinkDiscordModalOpen, setIsLinkDiscordModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isAccountsConnectModalOpen, setIsAccountsConnectModalOpen] = useState(false)

  const handleClose = () => {
    setIsLinkDiscordModalOpen(false)
  }

  const handleLinkAccounts = () => {
    handleClose()
    setIsAccountsConnectModalOpen(true)
  }

  const saveNoticeCount = (count: number) => {
    const noticeCount: NoticeCount = {
      lastDisplayTime: new Date().getTime(),
      count,
    }
    localStorage.setItem(SHOW_DISCORD_MODAL_KEY, JSON.stringify(noticeCount))
  }

  const handleShowModalOrToast = useCallback(() => {
    if (typeof window !== 'undefined' && account) {
      const parsedResult = noticeCountSchema.safeParse(JSON.parse(localStorage.getItem(SHOW_DISCORD_MODAL_KEY) || '{}'))
      if (!parsedResult.success) {
        setShowToast(true)
        saveNoticeCount(0)
      } else {
        const noticeCount = parsedResult.data
        const daysSinceLastDisplay = getDaysDifference(new Date(), new Date(noticeCount.lastDisplayTime))
        if (!isLoadingIsDiscordLinked && !isDiscordLinked) {
          if (noticeCount.count < 1) {
            setIsLinkDiscordModalOpen(true)
            saveNoticeCount(1)
          } else {
            if (daysSinceLastDisplay >= 7) {
              if (noticeCount.count < 2) {
                setIsLinkDiscordModalOpen(true)
                saveNoticeCount(2)
              } else {
                setShowToast(true)
                saveNoticeCount(noticeCount.count + 1)
              }
            }
          }
        }
        if (isDiscordLinked && !(validationChecked && isProfileValidated) && daysSinceLastDisplay >= 7) {
          setShowToast(true)
          saveNoticeCount(noticeCount.count + 1)
        }
      }
    }
  }, [account, isDiscordLinked, isLoadingIsDiscordLinked, isProfileValidated, validationChecked])

  useEffect(() => {
    handleShowModalOrToast()
  }, [handleShowModalOrToast])

  useEffect(() => {
    if (!account) {
      setIsLinkDiscordModalOpen(false)
      setShowToast(false)
    }
  }, [account])

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
        account={showToast ? undefined : AccountType.Discord}
      />
      <AccountLinkToast show={showToast} setIsModalOpen={setIsAccountsConnectModalOpen} />
    </>
  )
}
