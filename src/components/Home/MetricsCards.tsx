import React, { useMemo } from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposals from '../../hooks/useProposals'
import useTransparency from '../../hooks/useTransparency'
import useVotesCountByDate from '../../hooks/useVotesCountByDate'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'

import MetricsCard from './MetricsCard'
import './MetricsCards.css'

const now = Time().toDate()
const oneWeekAgo = Time(now).subtract(1, 'week').toDate()
const oneMonthAgo = Time(now).subtract(1, 'month').toDate()

const MetricsCards = () => {
  const t = useFormatMessage()
  const { data, isLoadingTransparencyData } = useTransparency()
  const treasuryAmount = useMemo(
    () =>
      data?.balances
        .reduce((acc, obj) => {
          return acc + Number(obj.amount) * obj.rate
        }, 0)
        .toFixed(2),
    [data?.balances]
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
      isLoading={isLoadingTransparencyData}
      loadingLabel={t('page.home.metrics.fetching_treasury_data')}
      category={t('page.home.metrics.treasury')}
      title={`$${t('general.number', { value: treasuryAmount })}`}
      description={t('page.home.metrics.consolidated')}
    />,
  ]

  return (
    <>
      <Mobile>
        <div className="MetricsCards__Carousel">{content}</div>
      </Mobile>
      <NotMobile>
        <div className="MetricsCards">{content}</div>
      </NotMobile>
    </>
  )
}

export default MetricsCards
