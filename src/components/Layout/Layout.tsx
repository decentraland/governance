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
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTrackLinkContext from 'decentraland-gatsby/dist/context/Track/useTrackLinkContext'
import { fetchManaBalance } from 'decentraland-gatsby/dist/utils/loader/manaBalance'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import { Navbar } from 'decentraland-ui/dist/components/Navbar/Navbar'
import { ManaBalancesProps } from 'decentraland-ui/dist/components/UserMenu/ManaBalances/ManaBalances.types'
import { config } from 'decentraland-ui/dist/config'
import type { PageProps } from 'gatsby'
import { isEmpty } from 'lodash'

import { getSupportedChainIds } from '../../helpers'
import useAnalyticsTrack from '../../hooks/useAnalyticsTrack'
import useDclFeatureFlags from '../../hooks/useDclFeatureFlags'
import useDclProfile from '../../hooks/useDclProfile'
import { FeatureFlags } from '../../utils/features'
import ExternalLinkWarningModal from '../Modal/ExternalLinkWarningModal'
import { LinkDiscordModal } from '../Modal/LinkDiscordModal/LinkDiscordModal'
import WalletSelectorModal from '../Modal/WalletSelectorModal'
import WrongNetworkModal from '../Modal/WrongNetworkModal'

import './Layout.css'

export type LayoutProps = Omit<PageProps, 'children'> & {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, userState] = useAuthContext()
  const track = useAnalyticsTrack()
  const { isFeatureFlagEnabled } = useDclFeatureFlags()

  const handleClickUserMenuOption = useTrackLinkContext(function (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    options: {
      eventTrackingName: string
      url?: string
      trackingId?: string
    }
  ) {
    event.preventDefault()
    track(DROPDOWN_MENU_ITEM_CLICK_EVENT, options)

    return null
  }, [])

  const handleClickNavbarOption = useTrackLinkContext(function (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    options: {
      eventTrackingName: string
      url?: string
      isExternal?: boolean
    }
  ) {
    track('Click on Navbar', options)

    return null
  }, [])

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
    queryKey: [`manaBalances#${user}`],
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

        case ChainId.ETHEREUM_SEPOLIA:
        case ChainId.ETHEREUM_GOERLI:
        case ChainId.ETHEREUM_RINKEBY:
        case ChainId.ETHEREUM_ROPSTEN: {
          const [ETHEREUM, MATIC] = await Promise.all([
            fetchManaBalance(user, chainId),
            fetchManaBalance(user, ChainId.MATIC_MUMBAI),
          ])

          return { ETHEREUM, MATIC }
        }

        case ChainId.MATIC_MAINNET:
        case ChainId.MATIC_MUMBAI: {
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
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, network: Network) => {
      event.preventDefault()
      track(DROPDOWN_MENU_BALANCE_CLICK_EVENT, { network })

      setTimeout(() => {
        window.open(config.get('ACCOUNT_URL'), '_blank', 'noopener')
      }, 300)
    },
    [track]
  )

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, track_uuid: string) => {
      track(DROPDOWN_MENU_DISPLAY_EVENT, { track_uuid })
    },
    [track]
  )

  const handleSignOut = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, track_uuid: string) => {
      track(DROPDOWN_MENU_SIGN_OUT_EVENT, { track_uuid })
      setTimeout(() => {
        userState.disconnect()
      }, 300)
    },
    [track, userState]
  )

  const hasProfile = !isEmpty(profile)

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
