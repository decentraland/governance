import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import BoxTabs from '../Common/BoxTabs'
import BoxTabsContainer from '../Common/BoxTabsContainer'
import BoxTabsContentContainer from '../Common/BoxTabsContentContainer'

import CoAuthoringTab from './CoAuthoringTab'
import './ProposalsCreatedBox.css'
import ProposalsCreatedTab from './ProposalsCreatedTab'

interface Props {
  address: string
}

enum Tab {
  ProposalsCreated = 'proposals_created',
  CoAuthoring = 'coauthoring',
}

function ProposalsCreatedBox({ address }: Props) {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.ProposalsCreated)

  return (
    <Container>
      <BoxTabsContainer>
        <BoxTabs>
          <BoxTabs.Left>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.ProposalsCreated)} active={activeTab === Tab.ProposalsCreated}>
              {t('page.profile.created_proposals.title')}
            </BoxTabs.Tab>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.CoAuthoring)} active={activeTab === Tab.CoAuthoring}>
              {t('page.profile.activity.coauthoring.title')}
            </BoxTabs.Tab>
          </BoxTabs.Left>
        </BoxTabs>
        <BoxTabsContentContainer>
          {activeTab === Tab.ProposalsCreated && <ProposalsCreatedTab address={address} />}
          {activeTab === Tab.CoAuthoring && <CoAuthoringTab address={address} />}
        </BoxTabsContentContainer>
      </BoxTabsContainer>
    </Container>
  )
}

export default ProposalsCreatedBox
