import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { ProjectStatus } from '../../../entities/Grant/types'
import { GrantWithUpdate, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import MetricsCard from '../../Home/MetricsCard'

import StatsContainer from './StatsContainer'

interface Props {
  projects: GrantWithUpdate[]
}

export default function StatsBiddingAndTendering({ projects }: Props) {
  const intl = useIntl()
  const t = useFormatMessage()
  const formatFundingValue = (value: number) => intl.formatNumber(value, CURRENCY_FORMAT_OPTIONS)

  const currentQuarter = Time().quarter()
  const currentQuarterStartDate = Time().startOf('quarter')

  const currentProjects = useMemo(
    () =>
      projects.filter(
        ({ status }) =>
          status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
      ),
    [projects]
  )
  const currentProjectsThisQuarter = useMemo(
    () => currentProjects.filter((item) => Time(item.contract?.start_at).isAfter(currentQuarterStartDate)),
    [currentProjects, currentQuarterStartDate]
  )
  const currentBidProjects = useMemo(
    () => currentProjectsThisQuarter.filter((item) => item.type === ProposalType.Bid),
    [currentProjectsThisQuarter]
  )
  const totalBidFunding = useMemo(
    () => currentBidProjects.reduce((total, obj) => total + obj.size, 0),
    [currentBidProjects]
  )

  return (
    <StatsContainer>
      <MetricsCard
        variant="dark"
        category={t('page.grants.bidding_and_tendering_stats.funding.category', { quarter: currentQuarter })}
        title={`${formatFundingValue(totalBidFunding)}`}
      />
      <MetricsCard
        variant="dark"
        href={locations.proposals({ type: ProposalType.Tender })}
        category={t('page.grants.bidding_and_tendering_stats.tender_opportunities.category')}
        title={t('page.grants.bidding_and_tendering_stats.tender_opportunities.total', { total: 1 })}
      />
      <MetricsCard
        variant="dark"
        href={locations.proposals({ type: ProposalType.Bid })}
        category={t('page.grants.bidding_and_tendering_stats.bid_opportunities.category')}
        title={t('page.grants.bidding_and_tendering_stats.bid_opportunities.total', { total: 1 })}
      />
    </StatsContainer>
  )
}
