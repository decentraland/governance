import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import useIsDebugAddress from '../../hooks/useIsDebugAddress'
import locations from '../../modules/locations'
import SearchInput from '../Search/SearchInput'

import './Navigation.css'

export enum NavigationTab {
  Home = 'home',
  Proposals = 'proposals',
  Profile = 'profile',
  Enacted = 'enacted',
  Transparency = 'transparency',
  Grants = 'grants',
  Debug = 'debug',
}

export type NavigationProps = {
  activeTab?: NavigationTab
}

const Navigation = ({ activeTab }: NavigationProps) => {
  const t = useFormatMessage()
  const [user] = useAuthContext()

  const { isDebugAddress } = useIsDebugAddress(user)

  return (
    <div className="Navigation">
      <Tabs>
        <Tabs.Left>
          <Link href={locations.home()}>
            <Tabs.Tab active={activeTab === NavigationTab.Home}>{t('navigation.home')}</Tabs.Tab>
          </Link>
          <Link href={locations.proposals()}>
            <Tabs.Tab active={activeTab === NavigationTab.Proposals}>{t('navigation.proposals')}</Tabs.Tab>
          </Link>
          <Link href={locations.grants()}>
            <Tabs.Tab active={activeTab === NavigationTab.Grants}>{t('navigation.grants')}</Tabs.Tab>
          </Link>
          {user && (
            <Link href={locations.profile({ address: user })}>
              <Tabs.Tab active={activeTab === NavigationTab.Profile}>{t('navigation.profile')}</Tabs.Tab>
            </Link>
          )}
          <Link href={locations.transparency()}>
            <Tabs.Tab active={activeTab === NavigationTab.Transparency}>{t('navigation.transparency')}</Tabs.Tab>
          </Link>
          {user && isDebugAddress && (
            <Link href={locations.debug()}>
              <Tabs.Tab active={activeTab === NavigationTab.Debug}>{t('navigation.debug')}</Tabs.Tab>
            </Link>
          )}
        </Tabs.Left>
        <Tabs.Right>
          <SearchInput />
        </Tabs.Right>
      </Tabs>
    </div>
  )
}

export default React.memo(Navigation)
