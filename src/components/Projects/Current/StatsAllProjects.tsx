import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { ProjectWithUpdate, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useOpenTendersTotal from '../../../hooks/useOpenTendersTotal'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import { isCurrentProject, isCurrentQuarterProject } from '../../../utils/projects'
import MetricsCard from '../../Home/MetricsCard'

import StatsContainer from './StatsContainer'

interface Props {
  projects: ProjectWithUpdate[]
}

export default function StatsAllProjects({ projects }: Props) {
  const intl = useIntl()
  const formatFundingValue = (value: number) => intl.formatNumber(value, CURRENCY_FORMAT_OPTIONS)
  const t = useFormatMessage()
  const endingThisWeekProjects = projects.filter((item) => {
    const finishAt = Time(item.contract?.finish_at)
    return finishAt.isAfter(Time()) && finishAt.isBefore(Time().add(1, 'week'))
  })

  const currentQuarter = Time().quarter()
  const currentProjects = useMemo(() => projects.filter(({ status }) => isCurrentProject(status)), [projects])
  const currentProjectsThisQuarter = useMemo(
    () => currentProjects.filter((item) => isCurrentQuarterProject(item.contract?.start_at)),
    [currentProjects]
  )
  const currentBidProjects = useMemo(
    () => currentProjectsThisQuarter.filter((item) => item.type === ProposalType.Bid),
    [currentProjectsThisQuarter]
  )
  const currentGrantProjects = useMemo(
    () => currentProjectsThisQuarter.filter((item) => item.type === ProposalType.Grant),
    [currentProjectsThisQuarter]
  )
  const totalBidFunding = useMemo(
    () => currentBidProjects.reduce((total, obj) => total + obj.size, 0),
    [currentBidProjects]
  )
  const totalGrantFunding = useMemo(
    () => currentGrantProjects.reduce((total, obj) => total + obj.size, 0) || 0,
    [currentGrantProjects]
  )
  const formattedTotalBidFunding = formatFundingValue(totalBidFunding)
  const formattedTotalGrantFunding = formatFundingValue(totalGrantFunding)

  const { total: totalOpenTenders } = useOpenTendersTotal()

  return (
    <StatsContainer>
      <MetricsCard
        variant="dark"
        fullWidth
        category={t('page.grants.all_projects_stats.projects.category')}
        title={t('page.grants.all_projects_stats.projects.total', { total: currentProjects.length })}
        description={t('page.grants.all_projects_stats.projects.ending_this_week', {
          total: endingThisWeekProjects.length,
        })}
      />
      <MetricsCard
        variant="dark"
        fullWidth
        category={t('page.grants.all_projects_stats.funding.category', { quarter: currentQuarter })}
        title={`${formatFundingValue(totalBidFunding + totalGrantFunding)}`}
        description={t('page.grants.all_projects_stats.funding.total', {
          grants: formattedTotalGrantFunding,
          bids: formattedTotalBidFunding,
        })}
      />
      <MetricsCard
        variant="dark"
        fullWidth
        href={locations.proposals({ type: ProposalType.Tender })}
        category={t('page.grants.all_projects_stats.opportunities.category')}
        title={t('page.grants.all_projects_stats.opportunities.total', { total: totalOpenTenders })}
      />
    </StatsContainer>
  )
}
