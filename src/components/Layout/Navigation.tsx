import React, { useEffect, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import { CoauthorStatus } from '../../entities/Coauthor/types'
import useCoauthoring from '../../hooks/useCoauthoring'
import locations, { ProposalActivityList } from '../../modules/locations'
import Dot from '../Icon/Dot'
import SearchInput from '../Search/SearchInput'

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
  const t = useFormatMessage()
  const [user] = useAuthContext()
  const [pendingCoathoring] = useCoauthoring(user, CoauthorStatus.PENDING)
  const [activityLocation, setActivityLocation] = useState<string>(
    locations.activity({ list: ProposalActivityList.MyProposals })
  )
  useEffect(() => {
    if (pendingCoathoring.length > 0) {
      setActivityLocation(locations.activity({ list: ProposalActivityList.CoAuthoring }))
    }
  }, [pendingCoathoring])

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
          <Link href={activityLocation} state={activityLocation}>
            <Tabs.Tab active={props.activeTab === NavigationTab.Activity}>
              <div className="ActivityTab">
                {t('navigation.activity')} {pendingCoathoring.length > 0 && <Dot />}
              </div>
            </Tabs.Tab>
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
