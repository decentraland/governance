import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEmpty from 'lodash/isEmpty'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useProposalsByParticipatingVP from '../../hooks/useProposalsByParticipatingVP'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import BoxTabs from '../Common/BoxTabs'
import BoxTabsContainer from '../Common/BoxTabsContainer'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'

import HomeLoader from './HomeLoader'
import HomeSectionHeader from './HomeSectionHeader'
import OpenProposal from './OpenProposal'
import './OpenProposals.css'

enum Tab {
  EndingSoon = 'endingSoon',
  ParticipatingVP = 'participatingVp',
}

interface Props {
  endingSoonProposals?: ProposalAttributes[]
  isLoadingProposals: boolean
}

const now = Time().toDate()
const twoWeeksAgo = Time(now).subtract(2, 'week').toDate()

const OpenProposals = ({ endingSoonProposals, isLoadingProposals }: Props) => {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.EndingSoon)

  const { proposals: proposalsByParticipatingVP, isLoadingProposals: isLoadingProposalsByParticipatingVp } =
    useProposalsByParticipatingVP(twoWeeksAgo, now)

  return (
    <div className="OpenProposals">
      <HomeSectionHeader
        title={t('page.home.open_proposals.title')}
        description={t('page.home.open_proposals.description')}
      />
      <BoxTabsContainer className="OpenProposals__ProposalsContainer">
        <BoxTabs>
          <BoxTabs.Left>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.EndingSoon)} active={activeTab === Tab.EndingSoon}>
              {t('page.home.open_proposals.ending_soon')}
            </BoxTabs.Tab>
            <BoxTabs.Tab onClick={() => setActiveTab(Tab.ParticipatingVP)} active={activeTab === Tab.ParticipatingVP}>
              {t('page.home.open_proposals.participating_vp')}
            </BoxTabs.Tab>
          </BoxTabs.Left>
        </BoxTabs>
        {activeTab === Tab.EndingSoon && (
          <>
            {!isLoadingProposals &&
              endingSoonProposals &&
              endingSoonProposals.map((proposal) => <OpenProposal key={proposal.id} proposal={proposal} />)}
            {isLoadingProposals && (
              <HomeLoader className="OpenProposals__Loader">{t('page.home.open_proposals.loading')}</HomeLoader>
            )}
            {!isLoadingProposals && isEmpty(endingSoonProposals) && (
              <Empty className="OpenProposals__Empty" description="No active proposals" />
            )}
          </>
        )}
        {activeTab === Tab.ParticipatingVP && (
          <>
            {!isLoadingProposalsByParticipatingVp &&
              proposalsByParticipatingVP &&
              proposalsByParticipatingVP.map((proposal) => <OpenProposal key={proposal.id} proposal={proposal} />)}
            {isLoadingProposalsByParticipatingVp && <HomeLoader>{t('page.home.open_proposals.loading')}</HomeLoader>}
            {!isLoadingProposalsByParticipatingVp && isEmpty(proposalsByParticipatingVP) && (
              <Empty className="OpenProposals__Empty" description="No proposals" />
            )}
          </>
        )}
      </BoxTabsContainer>
      <FullWidthButton className="OpenProposals__ViewAllButton" link={locations.proposals()}>
        {t('page.home.open_proposals.view_all_proposals')}
      </FullWidthButton>
    </div>
  )
}

export default OpenProposals
