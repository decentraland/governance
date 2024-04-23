import { useCallback } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Network } from '@dcl/schemas/dist/dapps/network'
import { ProviderType } from '@dcl/schemas/dist/dapps/provider-type'
import { Avatar } from '@dcl/schemas/dist/platform/profile'
import { useQuery } from '@tanstack/react-query'
import {
  DROPDOWN_MENU_BALANCE_CLICK_EVENT,
  DROPDOWN_MENU_DISPLAY_EVENT,
  DROPDOWN_MENU_ITEM_CLICK_EVENT,
  DROPDOWN_MENU_SIGN_OUT_EVENT,
} from 'decentraland-dapps/dist/containers/Navbar/constants'
import useNotifications from 'decentraland-dapps/dist/hooks/useNotifications'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import { Navbar } from 'decentraland-ui/dist/components/Navbar/Navbar'
import { ManaBalancesProps } from 'decentraland-ui/dist/components/UserMenu/ManaBalances/ManaBalances.types'
import { config } from 'decentraland-ui/dist/config'
import { isEmpty } from 'lodash'

import { useAuthContext } from '../../front/context/AuthProvider'
import { addressShortener, getSupportedChainIds } from '../../helpers'
import useAnalyticsTrack from '../../hooks/useAnalyticsTrack'
import useAnalyticsTrackLink from '../../hooks/useAnalyticsTrackLink'
import useDclFeatureFlags from '../../hooks/useDclFeatureFlags'
import useDclIdentity from '../../hooks/useDclIdentity'
import useDclProfile from '../../hooks/useDclProfile'
import { FeatureFlags } from '../../utils/features'
import { fetchManaBalance } from '../../utils/mana'
import AvatarComponent from '../Common/Avatar'
import ExternalLinkWarningModal from '../Modal/ExternalLinkWarningModal'
import { LinkDiscordModal } from '../Modal/LinkDiscordModal/LinkDiscordModal'
import WalletSelectorModal from '../Modal/WalletSelectorModal'
import WrongNetworkModal from '../Modal/WrongNetworkModal'

import './Layout.css'

type LayoutProps = {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, userState] = useAuthContext()
  const track = useAnalyticsTrack()
  const { isFeatureFlagEnabled } = useDclFeatureFlags()

  const handleClickUserMenuOption = useAnalyticsTrackLink(function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    options: {
      eventTrackingName: string
      url?: string
      trackingId?: string
    }
  ) {
    event.preventDefault()
    track(DROPDOWN_MENU_ITEM_CLICK_EVENT, options)

    return null
  })

  const handleClickNavbarOption = useAnalyticsTrackLink(function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _event: any,
    options: {
      eventTrackingName: string
      url?: string
      isExternal?: boolean
    }
  ) {
    track('Click on Navbar', options)

    return null
  })

  const handleSwitchNetwork = useCallback((chainId: ChainId) => userState.switchTo(chainId), [userState])

  const handleConnect = useCallback(
    (providerType: ProviderType, chainId: ChainId) => userState.connect(providerType, chainId),
    [userState]
  )

  const handleCancelConnect = useCallback(() => userState.select(false), [userState])

  const { profile, isLoadingDclProfile } = useDclProfile(user)
  const chainId = userState.chainId
  const isAuthDappEnabled = isFeatureFlagEnabled(FeatureFlags.AuthDapp)

  const { data: manaBalances } = useQuery({
    queryKey: ['manaBalances', user, chainId],
    queryFn: async () => {
      if (!user) {
        return {}
      }

      switch (chainId) {
        case ChainId.ETHEREUM_MAINNET: {
          const [ETHEREUM, MATIC] = await Promise.all([
            fetchManaBalance(user, chainId),
            fetchManaBalance(user, ChainId.MATIC_MAINNET),
          ])

          return { ETHEREUM, MATIC }
        }

        case ChainId.ETHEREUM_SEPOLIA: {
          const [ETHEREUM, MATIC] = await Promise.all([
            fetchManaBalance(user, chainId),
            fetchManaBalance(user, ChainId.MATIC_AMOY),
          ])

          return { ETHEREUM, MATIC }
        }

        case ChainId.MATIC_MAINNET:
        case ChainId.MATIC_AMOY: {
          const MATIC = await fetchManaBalance(user, chainId)
          return { MATIC }
        }

        default:
          return {}
      }
    },
    enabled: !!user,
  })

  const handleClickBalance = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any, network: Network) => {
      event.preventDefault()
      track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })

      setTimeout(() => {
        window.open(config.get('ACCOUNT_URL'), '_blank', 'noopener')
      }, 300)
    },
    [track]
  )

  const handleOpen = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_e: any, track_uuid: string) => {
      track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
    },
    [track]
  )

  const handleSignOut = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_e: any, track_uuid: string) => {
      track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      setTimeout(() => {
        userState.disconnect()
      }, 300)
    },
    [track, userState]
  )

  const withNotifications = true
  const dclIdentity = useDclIdentity()
  const hasProfile = !isEmpty(profile)
  const {
    isModalOpen,
    isNotificationsOnboarding,
    modalActiveTab,
    isLoading,
    notifications,
    handleNotificationsOpen,
    handleOnBegin,
    handleOnChangeModalTab,
  } = useNotifications(dclIdentity, withNotifications)

  return (
    <>
      <Navbar
        manaBalances={manaBalances as ManaBalancesProps['manaBalances']}
        address={user || undefined}
        avatar={hasProfile ? (profile as unknown as Avatar) : undefined}
        activePage="governance"
        isSignedIn={hasProfile}
        isSigningIn={userState.loading || isLoadingDclProfile}
        onClickBalance={handleClickBalance}
        onClickNavbarItem={handleClickNavbarOption}
        onClickUserMenuItem={handleClickUserMenuOption}
        onClickOpen={handleOpen}
        onClickSignIn={isAuthDappEnabled ? userState.authorize : userState.select}
        onClickSignOut={handleSignOut}
        notifications={
          withNotifications
            ? {
                locale: 'en',
                isLoading,
                isOnboarding: isNotificationsOnboarding,
                isOpen: isModalOpen,
                items: notifications,
                activeTab: modalActiveTab,
                onClick: handleNotificationsOpen,
                onClose: handleNotificationsOpen,
                onBegin: handleOnBegin,
                onChangeTab: (_, tab) => handleOnChangeModalTab(tab),
                renderProfile: (address: string) => (
                  <div className="layout__notifications-profile">
                    <AvatarComponent address={address} size="xs" /> {addressShortener(address)}
                  </div>
                ),
              }
            : undefined
        }
      />
      <main>{children}</main>
      <WrongNetworkModal
        currentNetwork={chainId}
        expectedNetworks={getSupportedChainIds()}
        onSwitchNetwork={handleSwitchNetwork}
        providerType={userState.providerType}
      />
      <WalletSelectorModal
        open={userState.selecting}
        loading={userState.loading}
        chainId={getSupportedChainIds()[0]}
        error={userState.error}
        onConnect={handleConnect}
        onClose={handleCancelConnect}
      />
      <LinkDiscordModal />
      <ExternalLinkWarningModal />
      <Footer locale="en" locales={['en']} isFullWidth={false} className="WiderFooter" />
    </>
  )
}
