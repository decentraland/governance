import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import './ActivityBox.css'
import CoAuthoringTab from './CoAuthoringTab'
import MyProposalsTab from './MyProposalsTab'
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
    <div className="ActivityBox">
      <Tabs>
        <Tabs.Left>
          <Tabs.Tab onClick={() => setActiveTab(Tab.MyProposals)} active={activeTab === Tab.MyProposals}>
            {t('page.profile.activity.my_proposals.title')}
          </Tabs.Tab>
          <Tabs.Tab onClick={() => setActiveTab(Tab.Watchlist)} active={activeTab === Tab.Watchlist}>
            {t('page.profile.activity.watchlist.title')}
          </Tabs.Tab>
          <Tabs.Tab onClick={() => setActiveTab(Tab.CoAuthoring)} active={activeTab === Tab.CoAuthoring}>
            {t('page.profile.activity.coauthoring.title')}
          </Tabs.Tab>
        </Tabs.Left>
      </Tabs>
      <div className="ActivityBox__Content">
        {activeTab === Tab.MyProposals && <MyProposalsTab />}
        {activeTab === Tab.Watchlist && <WatchlistTab />}
        {activeTab === Tab.CoAuthoring && <CoAuthoringTab />}
      </div>
    </div>
  )
}

export default ActivityBox
