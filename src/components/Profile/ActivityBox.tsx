import { useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { CoauthorStatus } from '../../entities/Coauthor/types'
import { isSameAddress } from '../../entities/Snapshot/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
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

interface Props {
  address?: string
}

const ActivityBox = ({ address }: Props) => {
  const [account] = useAuthContext()
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.MyProposals)

  const isLoggedUserProfile = isSameAddress(account, address || '')
  const { requestsStatus } = useProposalsByCoAuthor(isLoggedUserProfile ? account : null, CoauthorStatus.PENDING)

  return (
    <BoxTabsContainer>
      <BoxTabs>
        <BoxTabs.Left>
          <BoxTabs.Tab onClick={() => setActiveTab(Tab.MyProposals)} active={activeTab === Tab.MyProposals}>
            {isLoggedUserProfile
              ? t('page.profile.activity.my_proposals.title')
              : t('page.profile.created_proposals.title')}
          </BoxTabs.Tab>
          {isLoggedUserProfile && (
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.Watchlist)} active={activeTab === Tab.Watchlist}>
              {t('page.profile.activity.watchlist.title')}
            </BoxTabs.Tab>
          )}
          <BoxTabs.Tab onClick={() => setActiveTab(Tab.CoAuthoring)} active={activeTab === Tab.CoAuthoring}>
            {t('page.profile.activity.coauthoring.title')}
            {requestsStatus.length > 0 && <Dot className="ActivityBox__DotIcon" />}
          </BoxTabs.Tab>
        </BoxTabs.Left>
      </BoxTabs>
      <BoxTabsContentContainer>
        {activeTab === Tab.MyProposals && <ProposalsCreatedTab address={address} />}
        {activeTab === Tab.Watchlist && isLoggedUserProfile && <WatchlistTab />}
        {activeTab === Tab.CoAuthoring && <CoAuthoringTab address={address} pendingCoauthorRequests={requestsStatus} />}
      </BoxTabsContentContainer>
    </BoxTabsContainer>
  )
}

export default ActivityBox
