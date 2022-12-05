import React, { useMemo, useRef } from 'react'
import Flickity from 'react-flickity-component'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { DclData } from '../../clients/DclData'
import { ProposalStatus } from '../../entities/Proposal/types'
import useProposals from '../../hooks/useProposals'
import useVotesCountByDate from '../../hooks/useVotesCountByDate'
import locations from '../../modules/locations'

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

const now = Time().toDate()
const oneWeekAgo = Time(now).subtract(1, 'week').toDate()
const oneMonthAgo = Time(now).subtract(1, 'month').toDate()

const MetricsCards = () => {
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

  const { proposals: endingSoonProposals, isLoadingProposals: isLoadingEndingSoonProposals } = useProposals({
    status: ProposalStatus.Active,
    timeFrame: '2days',
    timeFrameKey: 'finish_at',
  })

  const { proposals: activeProposals, isLoadingProposals: isLoadingActiveProposals } = useProposals({
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
      href={locations.proposals()}
      key="page.home.metrics.active_proposals"
      isLoading={isLoadingActiveProposals || isLoadingEndingSoonProposals}
      loadingLabel={t('page.home.metrics.fetching_proposals_data')}
      category={t('page.home.metrics.proposals')}
      title={t('page.home.metrics.active_proposals', { value: activeProposals?.total })}
      description={t('page.home.metrics.ending_soon', { value: endingSoonProposals?.total })}
    />,
    <MetricsCard
      href="/#engagement"
      key="page.home.metrics.votes_this_week"
      isLoading={isLoadingOneMonthVotesCount || isLoadingOneWeekVotesCount}
      loadingLabel={t('page.home.metrics.fetching_participation_data')}
      category={t('page.home.metrics.participation')}
      title={t('page.home.metrics.votes_this_week', { value: votesCountThisWeek })}
      description={t('page.home.metrics.votes_last_month', { value: votesCountLastMonth })}
    />,
    <MetricsCard
      href={locations.transparency()}
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
      <Mobile>
        <Flickity
          className="MetricsCards__Carousel"
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {content}
        </Flickity>
      </Mobile>
      <NotMobile>
        <Container>
          <div className="MetricsCards">{content}</div>
        </Container>
      </NotMobile>
    </>
  )
}

export default MetricsCards
