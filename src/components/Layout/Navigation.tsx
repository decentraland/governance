import React from 'react'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Link } from 'gatsby-plugin-intl'
import locations, { ProposalActivityList } from '../../modules/locations'
import SearchInput from "../Search/SearchInput"
import './Navigation.css'

export enum NavigationTab {
  Proposals = 'proposals',
  Wrapping = 'wrapping',
  Enacted = 'enacted',
  Activity = 'activity',
  Transparency = 'transparency',
}

type NavigationProps = {
  activeTab?: NavigationTab
  search?: boolean
}

const Navigation = (props: NavigationProps) => {
  const l = useFormatMessage()
  const [ user ] = useAuthContext()
  return (
    <Tabs>
      <Tabs.Left>
        <Link to={locations.proposals()}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Proposals}>
            {l('navigation.proposals')}
          </Tabs.Tab>
        </Link>
        {user && <Link to={locations.balance()}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Wrapping}>
            {l('navigation.wrapping')}
          </Tabs.Tab>
        </Link>}
        <Link to={locations.transparency()}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Transparency}>
            {l('navigation.transparency')}
          </Tabs.Tab>
        </Link>
        {user && <Link to={locations.activity({ list: ProposalActivityList.MyProposals })}>
          <Tabs.Tab active={props.activeTab === NavigationTab.Activity}>
            {l('navigation.activity')}
          </Tabs.Tab>
        </Link>}

      </Tabs.Left>
      <Tabs.Right>
        <SearchInput />
      </Tabs.Right>
    </Tabs>
  )
}

export default React.memo(Navigation)
