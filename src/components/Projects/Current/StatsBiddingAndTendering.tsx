import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { useLocation } from '@reach/router'

import { ProjectWithUpdate, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS, validateQuarter, validateYear } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useOpenPitchesTotal from '../../../hooks/useOpenPitchesTotal'
import useOpenTendersTotal from '../../../hooks/useOpenTendersTotal'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import { isCurrentProject, isCurrentQuarterProject } from '../../../utils/projects'
import MetricsCard from '../../Home/MetricsCard'

import StatsContainer from './StatsContainer'

interface Props {
  projects: ProjectWithUpdate[]
}

export default function StatsBiddingAndTendering({ projects }: Props) {
  const intl = useIntl()
  const t = useFormatMessage()
  const formatFundingValue = (value: number) => intl.formatNumber(value, CURRENCY_FORMAT_OPTIONS)

  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const yearParam = params.get('year')
  const quarterParam = params.get('quarter')
  const validatedYear = validateYear(yearParam)
  const validatedQuarter = validateQuarter(quarterParam)
  const isYearAndQuarterValid = validatedYear && validatedQuarter

  const currentYear = isYearAndQuarterValid ? validatedYear : Time().year()
  const currentQuarter = isYearAndQuarterValid ? validatedQuarter : Time().quarter()

  const currentProjects = useMemo(() => projects.filter(({ status }) => isCurrentProject(status)), [projects])
  const currentProjectsThisQuarter = useMemo(
    () =>
      currentProjects.filter((item) => isCurrentQuarterProject(currentYear, currentQuarter, item.contract?.start_at)),
    [currentProjects, currentQuarter, currentYear]
  )
  const currentBidProjects = useMemo(
    () => currentProjectsThisQuarter.filter((item) => item.type === ProposalType.Bid),
    [currentProjectsThisQuarter]
  )
  const totalBidFunding = useMemo(
    () => currentBidProjects.reduce((total, obj) => total + obj.size, 0),
    [currentBidProjects]
  )

  const { total: totalOpenPitches } = useOpenPitchesTotal()
  const { total: totalOpenTenders } = useOpenTendersTotal()

  return (
    <StatsContainer>
      <MetricsCard
        variant="dark"
        fullWidth
        category={t('page.grants.bidding_and_tendering_stats.funding.category', {
          year: currentYear,
          quarter: currentQuarter,
        })}
        title={formatFundingValue(totalBidFunding)}
      />
      <MetricsCard
        variant="dark"
        fullWidth
        href={locations.proposals({ type: ProposalType.Pitch })}
        category={t('page.grants.bidding_and_tendering_stats.tender_opportunities.category')}
        title={t('page.grants.bidding_and_tendering_stats.tender_opportunities.total', { total: totalOpenPitches })}
      />
      <MetricsCard
        variant="dark"
        fullWidth
        href={locations.proposals({ type: ProposalType.Tender })}
        category={t('page.grants.bidding_and_tendering_stats.bid_opportunities.category')}
        title={t('page.grants.bidding_and_tendering_stats.bid_opportunities.total', { total: totalOpenTenders })}
      />
    </StatsContainer>
  )
}
