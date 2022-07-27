import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import useParticipatingVP from '../../hooks/useParticipatingVP'
import useVotesPerProposal from '../../hooks/useVotesPerProposal'
import LineChart from '../Charts/LineChart'

import './HomeCharts.css'

enum ChartTypes {
  ParticipatingVP,
  VotesPerProposal,
}

const getNewDate = (startDate: Date, days: number) => new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)

const now = new Date()

function HomeCharts() {
  const [selectedTab, setSelectedTab] = useState(ChartTypes.ParticipatingVP)
  const { participatingVP } = useParticipatingVP(getNewDate(now, -365), now)
  const { votesPerProposal } = useVotesPerProposal(getNewDate(now, -365), now)
  const t = useFormatMessage()

  const Charts: Record<ChartTypes, JSX.Element> = {
    [ChartTypes.ParticipatingVP]: (
      <LineChart
        label={t('page.home.community_engagement.participating_vp')}
        data={participatingVP}
        unit={t('modal.votes_list.vp')}
        colors={['#FF2D55', '#C640CD']}
      />
    ),
    [ChartTypes.VotesPerProposal]: (
      <LineChart
        label={t('page.home.community_engagement.votes_per_proposal_title')}
        data={votesPerProposal}
        unit={t('page.home.community_engagement.votes_per_proposal')}
        colors={['#FF2D55', '#FFC700']}
      />
    ),
  }

  return (
    <Card className="HomeCharts">
      <Tabs>
        <Tabs.Left>
          <Tabs.Tab
            active={selectedTab === ChartTypes.ParticipatingVP}
            onClick={() => setSelectedTab(ChartTypes.ParticipatingVP)}
          >
            {t('page.home.community_engagement.participating_vp_title')}
          </Tabs.Tab>
          <Tabs.Tab
            active={selectedTab === ChartTypes.VotesPerProposal}
            onClick={() => setSelectedTab(ChartTypes.VotesPerProposal)}
          >
            {t('page.home.community_engagement.votes_per_proposal_title')}
          </Tabs.Tab>
        </Tabs.Left>
        <Tabs.Right>
          <Header sub className="Display">
            {t('page.home.community_engagement.display_median')}
          </Header>
        </Tabs.Right>
      </Tabs>
      {Charts[selectedTab]}
    </Card>
  )
}

export default HomeCharts
