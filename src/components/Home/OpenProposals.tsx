import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'
import { isEmpty } from 'lodash'

import { ProposalStatus } from '../../entities/Proposal/types'
import useProposals from '../../hooks/useProposals'
import useProposalsByParticipatingVP from '../../hooks/useProposalsByParticipatingVP'
import locations from '../../modules/locations'
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

const now = Time().toDate()
const twoWeeksAgo = Time(now).subtract(2, 'week').toDate()

const OpenProposals = () => {
  const t = useFormatMessage()
  const [activeTab, setActiveTab] = useState(Tab.EndingSoon)
  const { proposals: endingSoonProposals, isLoadingProposals } = useProposals({
    order: 'ASC',
    status: ProposalStatus.Active,
    timeFrameKey: 'finish_at',
    page: 1,
    itemsPerPage: 5,
  })

  const { proposals: proposalsByParticipatingVP, isLoadingProposals: isLoadingProposalsByParticipatingVp } =
    useProposalsByParticipatingVP(twoWeeksAgo, now)

  return (
    <>
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
        {activeTab === Tab.EndingSoon && (
          <>
            {!isLoadingProposals &&
              endingSoonProposals?.data &&
              endingSoonProposals.data.map((proposal) => <OpenProposal key={proposal.id} proposal={proposal} />)}
            {isLoadingProposals && (
              <HomeLoader className="OpenProposals__Loader">{t('page.home.open_proposals.loading')}</HomeLoader>
            )}
            {!isLoadingProposals && isEmpty(endingSoonProposals?.data) && (
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
      </div>
      <FullWidthButton className="OpenProposals__ViewAllButton" link={locations.proposals()}>
        {t('page.home.open_proposals.view_all_proposals')}
      </FullWidthButton>
    </>
  )
}

export default OpenProposals
