import { useState } from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'

import useFormatMessage from '../../hooks/useFormatMessage'
import useParticipatingVP from '../../hooks/useParticipatingVP'
import useVotesPerProposal from '../../hooks/useVotesPerProposal'
import LineChart from '../Charts/LineChart'
import BoxTabs from '../Common/BoxTabs'

import './Charts.css'
import HomeLoader from './HomeLoader'

enum ChartType {
  ParticipatingVP,
  VotesPerProposal,
}

const now = new Date()
const start = new Date(now.getFullYear() - 1, now.getMonth(), 1)
const end = new Date(now.getFullYear(), now.getMonth(), 1)

function Charts() {
  const [selectedTab, setSelectedTab] = useState(ChartType.ParticipatingVP)
  const { participatingVP, isLoadingParticipatingVP } = useParticipatingVP(start, end)
  const { votesPerProposal, isLoadingVotesPerProposal } = useVotesPerProposal(start, end)
  const t = useFormatMessage()

  const isSelectedParticipatingVPTab = selectedTab === ChartType.ParticipatingVP
  const isSelectedVotesPerProposalTab = selectedTab === ChartType.VotesPerProposal

  return (
    <Card className="HomeCharts">
      <BoxTabs>
        <BoxTabs.Left>
          <BoxTabs.Tab active={isSelectedParticipatingVPTab} onClick={() => setSelectedTab(ChartType.ParticipatingVP)}>
            {t('page.home.community_engagement.participating_vp_title')}
          </BoxTabs.Tab>
          <BoxTabs.Tab
            active={isSelectedVotesPerProposalTab}
            onClick={() => setSelectedTab(ChartType.VotesPerProposal)}
          >
            {t('page.home.community_engagement.votes_per_proposal_title')}
          </BoxTabs.Tab>
        </BoxTabs.Left>
        <BoxTabs.Right>
          <Desktop>
            <Header sub className="HomeCharts__Display">
              {t('page.home.community_engagement.display_median')}
            </Header>
          </Desktop>
        </BoxTabs.Right>
      </BoxTabs>
      {((isSelectedParticipatingVPTab && isLoadingParticipatingVP) ||
        (isSelectedVotesPerProposalTab && isLoadingVotesPerProposal)) && (
        <div className="Charts__Loader">
          <HomeLoader>{t('page.home.community_engagement.fetching_participation')}</HomeLoader>
        </div>
      )}
      {isSelectedParticipatingVPTab && !isLoadingParticipatingVP && (
        <LineChart
          label={t('page.home.community_engagement.participating_vp')}
          data={participatingVP}
          unit={t('modal.votes_list.vp')}
          colors={['#FF2D55', '#C640CD']}
        />
      )}
      {isSelectedVotesPerProposalTab && !isLoadingVotesPerProposal && (
        <LineChart
          label={t('page.home.community_engagement.votes_per_proposal_title')}
          data={votesPerProposal}
          unit={t('page.home.community_engagement.votes_per_proposal')}
          colors={['#FF2D55', '#FFC700']}
        />
      )}
    </Card>
  )
}

export default Charts
