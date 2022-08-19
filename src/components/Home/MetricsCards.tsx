import React, { useMemo, useRef } from 'react'
import Flickity from 'react-flickity-component'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { DclData } from '../../api/DclData'
import { ProposalStatus } from '../../entities/Proposal/types'
import useProposals from '../../hooks/useProposals'
import useVotesCountByDate from '../../hooks/useVotesCountByDate'

import MetricsCard from './MetricsCard'
import './MetricsCards.css'

const flickityOptions = {
  cellAlign: 'left',
  accessibility: true,
  pageDots: false,
  prevNextButtons: false,
  draggable: true,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
}

const now = new Date()
const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDay() - 7)
const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDay())

const MetricsCards = () => {
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const flickity = useRef<Flickity>()
  const t = useFormatMessage()
  const [transparencyData, transparencyState] = useAsyncMemo(async () => DclData.get().getData())
  const treasuryAmount = useMemo(
    () =>
      transparencyData?.balances
        .reduce((acc, obj) => {
          return acc + Number(obj.amount) * obj.rate
        }, 0)
        .toFixed(2),
    [transparencyData?.balances]
  )

  const { proposals: activeProposals, isLoadingProposals: isLoadingActiveProposals } = useProposals({
    status: ProposalStatus.Active,
    timeFrame: '2days',
    timeFrameKey: 'finish_at',
  })

  const { proposals: endingSoonProposals, isLoadingProposals: isLoadingEndingSoonProposals } = useProposals({
    status: ProposalStatus.Active,
  })

  const { votesCount: votesCountThisWeek, isLoadingVotesCount: isLoadingOneWeekVotesCount } = useVotesCountByDate(
    oneWeekAgo,
    now
  )
  const { votesCount: votesCountLastMonth, isLoadingVotesCount: isLoadingOneMonthVotesCount } = useVotesCountByDate(
    oneMonthAgo,
    now
  )

  const content = [
    <MetricsCard
      key="page.home.metrics.active_proposals"
      isLoading={isLoadingActiveProposals || isLoadingEndingSoonProposals}
      loadingLabel={t('page.home.metrics.fetching_proposals_data')}
      category={t('page.home.metrics.proposals')}
      title={t('page.home.metrics.active_proposals', { value: activeProposals?.total })}
      description={t('page.home.metrics.ending_soon', { value: endingSoonProposals?.total })}
    />,
    <MetricsCard
      key="page.home.metrics.votes_this_week"
      isLoading={isLoadingOneMonthVotesCount || isLoadingOneWeekVotesCount}
      loadingLabel={t('page.home.metrics.fetching_participation_data')}
      category={t('page.home.metrics.participation')}
      title={t('page.home.metrics.votes_this_week', { value: votesCountThisWeek })}
      description={t('page.home.metrics.votes_last_month', { value: votesCountLastMonth })}
    />,
    <MetricsCard
      key="page.home.metrics.treasury_amount"
      isLoading={transparencyState.loading}
      loadingLabel={t('page.home.metrics.fetching_treasury_data')}
      category={t('page.home.metrics.treasury')}
      title={`$${t('general.number', { value: treasuryAmount })}`}
      description={t('page.home.metrics.consolidated')}
    />,
  ]

  return (
    <>
      {isMobile ? (
        <Flickity
          className="MetricsCards__Carousel"
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {content}
        </Flickity>
      ) : (
        <Container>
          <div className="MetricsCards">{content}</div>
        </Container>
      )}
    </>
  )
}

export default MetricsCards
