import React from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import WalletSelectorModal from 'decentraland-gatsby/dist/components/Modal/WalletSelectorModal'
import WrongNetworkModal from 'decentraland-gatsby/dist/components/Modal/WrongNetworkModal'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { changeLocale } from 'decentraland-gatsby/dist/plugins/intl'
import { DecentralandIntlContext } from 'decentraland-gatsby/dist/plugins/intl/types'
import env from 'decentraland-gatsby/dist/utils/env'
import { Footer } from 'decentraland-ui/dist/components/Footer/Footer'
import { Locale } from 'decentraland-ui/dist/components/LanguageIcon/LanguageIcon'
import { Navbar, NavbarProps } from 'decentraland-ui/dist/components/Navbar/Navbar'
import type { PageProps } from 'gatsby'
import type { DropdownProps } from 'semantic-ui-react/dist/commonjs/modules/Dropdown'

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
  pageContext?: {
    intl?: DecentralandIntlContext
  }
  children?: React.ReactNode
}

export default function Layout({ children, pageContext, ...props }: LayoutProps) {
  const locale = pageContext?.intl?.locale || 'en'
  const locales = pageContext?.intl?.locales || ['en']
  const [, state] = useAuthContext()

  const handleChangeLocal = function (_: React.SyntheticEvent<HTMLElement>, data: DropdownProps) {
    changeLocale(data.value as string)
  }

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

  return (
    <>
      <Navbar activePage="dao" onClickMenuOption={handleClickMenuOption} rightMenu={props.rightMenu} />
      <main>{children}</main>
      <WrongNetworkModal
        currentNetwork={state.chainId}
        expectedNetwork={getSupportedChainIds()}
        onSwitchNetwork={(chainId) => state.switchTo(chainId)}
        providerType={state.providerType}
      />
      <WalletSelectorModal
        open={state.selecting}
        loading={state.loading}
        error={state.error}
        onConnect={(providerType, chainId) => state.connect(providerType, chainId)}
        onClose={() => state.select(false)}
      />
      <Footer
        locale={locale as Locale}
        locales={locales as Locale[]}
        isFullWidth={false}
        onChange={handleChangeLocal}
      />
    </>
  )
}
