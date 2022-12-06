import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import BoxTabs from '../Common/BoxTabs'
import BoxTabsContainer from '../Common/BoxTabsContainer'
import BoxTabsContentContainer from '../Common/BoxTabsContentContainer'

import CoAuthoringTab from './CoAuthoringTab'
import ProposalsCreatedTab from './ProposalsCreatedTab'
import WatchlistTab from './WatchlistTab'

enum Tab {
  MyProposals = 'myProposals',
  Watchlist = 'watchlist',
  CoAuthoring = 'coauthoring',
}

const ActivityBox = () => {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.MyProposals)

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
          </BoxTabs.Tab>
        </BoxTabs.Left>
      </BoxTabs>
      <BoxTabsContentContainer>
        {activeTab === Tab.MyProposals && <ProposalsCreatedTab />}
        {activeTab === Tab.Watchlist && <WatchlistTab />}
        {activeTab === Tab.CoAuthoring && <CoAuthoringTab />}
      </BoxTabsContentContainer>
    </BoxTabsContainer>
  )
}

export default ActivityBox
