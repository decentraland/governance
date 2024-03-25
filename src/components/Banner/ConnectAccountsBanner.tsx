import { useState } from 'react'

import { HIDE_CONNECT_ACCOUNTS_BANNER_KEY } from '../../front/localStorageKeys'
import useFormatMessage from '../../hooks/useFormatMessage'
import BellCircled from '../Icon/BellCircled'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import Banner from './Banner'

export const shouldShowConnectAccountsBanner = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HIDE_CONNECT_ACCOUNTS_BANNER_KEY) !== 'true'
  }

  return false
}

export default function ConnectAccountsBanner() {
  const t = useFormatMessage()
  const [isAccountsConnectModalOpen, setIsAccountsConnectModalOpen] = useState(false)

  return (
    <>
      <Banner
        color="purple"
        isVisible={shouldShowConnectAccountsBanner()}
        title={t(`banner.connect_accounts.title`)}
        description={t(`banner.connect_accounts.description`)}
        bannerHideKey={HIDE_CONNECT_ACCOUNTS_BANNER_KEY}
        icon={<BellCircled />}
        buttonLabel={t(`banner.connect_accounts.button_label`)}
        onButtonClick={() => setIsAccountsConnectModalOpen(true)}
      />
      <AccountsConnectModal open={isAccountsConnectModalOpen} onClose={() => setIsAccountsConnectModalOpen(false)} />
    </>
  )
}
