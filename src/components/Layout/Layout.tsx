import React from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { useLocation } from '@reach/router'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import env from 'decentraland-gatsby/dist/utils/env'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import { Navbar, NavbarProps } from 'decentraland-ui/dist/components/Navbar/Navbar'
import type { PageProps } from 'gatsby'

import { isProjectPath } from '../../utils/locations'
import SnapshotStatus from '../Debug/SnapshotStatus'
import WalletSelectorModal from '../Modal/WalletSelectorModal'
import WrongNetworkModal from '../Modal/WrongNetworkModal'

import './Layout.css'

const CHAIN_ID: ChainId[] = env('GATSBY_DEFAULT_CHAIN_ID', String(ChainId.ETHEREUM_MAINNET))
  .split(',')
  .filter(Boolean)
  .map((chainId) => Number(chainId))

export function getSupportedChainIds(): ChainId[] {
  return CHAIN_ID
}

export type LayoutProps = Omit<PageProps, 'children'> & {
  rightMenu: NavbarProps['rightMenu']
  children?: React.ReactNode
}

export default function Layout({ children, ...props }: LayoutProps) {
  const [, state] = useAuthContext()
  const location = useLocation()

  const handleClickMenuOption = function (event: React.MouseEvent, section: string) {
    if (!event.defaultPrevented) {
      return {
        place: 'navbar',
        section,
        menu: section.split('_'),
      }
    }

    return null
  }

  const isWiderLayout = isProjectPath(location.pathname)

  return (
    <>
      <Navbar
        activePage="dao"
        onClickMenuOption={handleClickMenuOption}
        rightMenu={props.rightMenu}
        className={isWiderLayout ? 'WiderNavbar' : undefined}
      />
      <main>{children}</main>
      <WrongNetworkModal
        currentNetwork={state.chainId}
        expectedNetworks={getSupportedChainIds()}
        onSwitchNetwork={(chainId) => state.switchTo(chainId)}
        providerType={state.providerType}
      />
      <WalletSelectorModal
        open={state.selecting}
        loading={state.loading}
        chainId={getSupportedChainIds()[0]}
        error={state.error}
        onConnect={(providerType, chainId) => state.connect(providerType, chainId)}
        onClose={() => state.select(false)}
      />
      <Footer locale="en" locales={['en']} isFullWidth={false} className={isWiderLayout ? 'WiderFooter' : undefined} />
    </>
  )
}
