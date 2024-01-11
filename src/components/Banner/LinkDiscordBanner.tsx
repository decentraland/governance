import { useState } from 'react'

import { AccountType } from '../../entities/User/types'
import { HIDE_LINK_DISCORD_BANNER_KEY, HIDE_LINK_DISCORD_MODAL_KEY } from '../../front/localStorageKeys'
import useFormatMessage from '../../hooks/useFormatMessage'
import DiscordCircledBanner from '../Icon/DiscordCircledBanner'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import Banner from './Banner'

export const shouldShowLinkDiscordBanner = () => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem(HIDE_LINK_DISCORD_MODAL_KEY) === 'true' &&
      localStorage.getItem(HIDE_LINK_DISCORD_BANNER_KEY) !== 'true'
    )
  }

  return false
}

function LinkDiscordBanner() {
  const t = useFormatMessage()
  const [isAccountsConnectModalOpen, setIsAccountsConnectModalOpen] = useState(false)

  const handleCloseModal = () => {
    localStorage.setItem(HIDE_LINK_DISCORD_BANNER_KEY, 'true')
    setIsAccountsConnectModalOpen(false)
  }

  return (
    <>
      <Banner
        color="purple"
        isVisible={shouldShowLinkDiscordBanner()}
        title={t(`banner.link_discord.title`)}
        description={t(`banner.link_discord.description`)}
        bannerHideKey={HIDE_LINK_DISCORD_BANNER_KEY}
        icon={<DiscordCircledBanner />}
        buttonLabel={t(`banner.link_discord.button_label`)}
        onButtonClick={() => setIsAccountsConnectModalOpen(true)}
      />
      <AccountsConnectModal
        open={isAccountsConnectModalOpen}
        onClose={handleCloseModal}
        account={AccountType.Discord}
      />
    </>
  )
}

export default LinkDiscordBanner
