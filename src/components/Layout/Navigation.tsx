import React from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import useIsAdmin from '../../hooks/useIsAdmin'
import locations, { ProposalActivityList } from '../../modules/locations'
import SearchInput from '../Search/SearchInput'

import './Navigation.css'

export enum NavigationTab {
  Proposals = 'proposals',
  Wrapping = 'wrapping',
  Enacted = 'enacted',
  Activity = 'activity',
  Transparency = 'transparency',
  Admin = 'admin',
}

type NavigationProps = {
  activeTab?: NavigationTab
  search?: boolean
}

const Navigation = (props: NavigationProps) => {
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const { isAdmin } = useIsAdmin(user)

  return (
    <Tabs>
      <Tabs.Left>
        <Link href={locations.proposals()}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Proposals}>{t('navigation.proposals')}</Tabs.Tab>
        </Link>
        {user && (
          <Link href={locations.balance()}>
            <Tabs.Tab active={props.activeTab === NavigationTab.Wrapping}>{t('navigation.wrapping')}</Tabs.Tab>
          </Link>
        )}
        <Link href={locations.transparency()}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Transparency}>{t('navigation.transparency')}</Tabs.Tab>
        </Link>
        {user && (
          <Link href={locations.activity({ list: ProposalActivityList.MyProposals })}>
            <Tabs.Tab active={props.activeTab === NavigationTab.Activity}>{t('navigation.activity')}</Tabs.Tab>
          </Link>
        )}
        {user && isAdmin && (
          <Link href={locations.admin()}>
            <Tabs.Tab active={props.activeTab === NavigationTab.Admin}>{t('navigation.admin')}</Tabs.Tab>
          </Link>
        )}
      </Tabs.Left>
      <Tabs.Right>
        <SearchInput />
      </Tabs.Right>
    </Tabs>
  )
}

export default React.memo(Navigation)
