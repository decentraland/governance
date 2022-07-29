import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import { ProposalStatus } from '../../entities/Proposal/types'
import useProposals from '../../hooks/useProposals'
import locations from '../../modules/locations'
import FullWidthButton from '../Common/FullWidthButton'

import HomeSectionHeader from './HomeSectionHeader'
import OpenProposal from './OpenProposal'
import './OpenProposals.css'

enum Tab {
  EndingSoon = 'endingSoon',
  ParticipatingVP = 'participatingVp',
}

const OpenProposals = () => {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.EndingSoon)
  const { proposals } = useProposals({
    status: ProposalStatus.Finished, // TODO: Change to active
    page: 1,
    itemsPerPage: 5,
  })

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
              {t('page.home.open_proposals.ending_soon')}
            </Tabs.Tab>
            <Tabs.Tab onClick={() => setActiveTab(Tab.ParticipatingVP)} active={activeTab === Tab.ParticipatingVP}>
              {t('page.home.open_proposals.participating_vp')}
            </Tabs.Tab>
          </Tabs.Left>
        </Tabs>
        {activeTab === Tab.EndingSoon &&
          proposals?.data &&
          proposals.data.map((proposal) => <OpenProposal key={proposal.id} proposal={proposal} />)}
      </div>
      <FullWidthButton className="OpenProposals__ViewAllButton" link={locations.proposals()}>
        {t('page.home.open_proposals.view_all_proposals')}
      </FullWidthButton>
    </Container>
  )
}

export default OpenProposals
