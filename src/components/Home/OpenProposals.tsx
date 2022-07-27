import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import locations from '../../modules/locations'
import FullWidthButton from '../Common/FullWidthButton'

import HomeSectionHeader from './HomeSectionHeader'
import './OpenProposals.css'

enum Tab {
  EndingSoon = 'endingSoon',
  ParticipatingVP = 'participatingVp',
}

const OpenProposals = () => {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.EndingSoon)

  return (
    <Container>
      <HomeSectionHeader
        title={t('page.home.open_proposals.title')}
        description={t('page.home.open_proposals.description')}
      />
      <div className="OpenProposals__ProposalsContainer">
        <Tabs>
          <Tabs.Left>
            <Tabs.Tab onClick={() => setActiveTab(Tab.EndingSoon)} active={activeTab === Tab.EndingSoon}>
              {t('page.home.open_proposals.ending_soon.title')}
            </Tabs.Tab>
            <Tabs.Tab onClick={() => setActiveTab(Tab.ParticipatingVP)} active={activeTab === Tab.ParticipatingVP}>
              {t('page.home.open_proposals.participating_vp.title')}
            </Tabs.Tab>
          </Tabs.Left>
        </Tabs>
      </div>
      <FullWidthButton className="OpenProposals__ViewAllButton" link={locations.proposals()}>
        {t('page.home.open_proposals.view_all_proposals')}
      </FullWidthButton>
    </Container>
  )
}

export default OpenProposals
