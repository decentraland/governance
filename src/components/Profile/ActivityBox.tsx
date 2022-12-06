import React, { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { CoauthorStatus } from '../../entities/Coauthor/types'
import useProposalsByCoAuthor from '../../hooks/useProposalsByCoAuthor'
import BoxTabs from '../Common/BoxTabs'
import BoxTabsContainer from '../Common/BoxTabsContainer'
import BoxTabsContentContainer from '../Common/BoxTabsContentContainer'
import Dot from '../Icon/Dot'

import './ActivityBox.css'
import CoAuthoringTab from './CoAuthoringTab'
import ProposalsCreatedTab from './ProposalsCreatedTab'
import WatchlistTab from './WatchlistTab'

enum Tab {
  MyProposals = 'myProposals',
  Watchlist = 'watchlist',
  CoAuthoring = 'coauthoring',
}

const ActivityBox = () => {
  const [account] = useAuthContext()
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.MyProposals)

  const [pendingCoauthorRequests] = useProposalsByCoAuthor(account, CoauthorStatus.PENDING)

  return (
    <BoxTabsContainer>
      <BoxTabs>
        <BoxTabs.Left>
          <BoxTabs.Tab onClick={() => setActiveTab(Tab.MyProposals)} active={activeTab === Tab.MyProposals}>
            {t('page.profile.activity.my_proposals.title')}
          </BoxTabs.Tab>
          <BoxTabs.Tab onClick={() => setActiveTab(Tab.Watchlist)} active={activeTab === Tab.Watchlist}>
            {t('page.profile.activity.watchlist.title')}
          </BoxTabs.Tab>
          <BoxTabs.Tab onClick={() => setActiveTab(Tab.CoAuthoring)} active={activeTab === Tab.CoAuthoring}>
            {t('page.profile.activity.coauthoring.title')}
            {pendingCoauthorRequests.length > 0 && <Dot className="ActivityBox__DotIcon" />}
          </BoxTabs.Tab>
        </BoxTabs.Left>
      </BoxTabs>
      <BoxTabsContentContainer>
        {activeTab === Tab.MyProposals && <ProposalsCreatedTab />}
        {activeTab === Tab.Watchlist && <WatchlistTab />}
        {activeTab === Tab.CoAuthoring && <CoAuthoringTab pendingCoauthorRequests={pendingCoauthorRequests} />}
      </BoxTabsContentContainer>
    </BoxTabsContainer>
  )
}

export default ActivityBox
