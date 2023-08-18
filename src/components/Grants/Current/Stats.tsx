import React, { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { ProjectStatus } from '../../../entities/Grant/types'
import { GrantWithUpdate, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import Time from '../../../utils/date/Time'
import MetricsCard from '../../Home/MetricsCard'

import './Stats.css'

interface Props {
  projects: GrantWithUpdate[]
  status?: ProjectStatus | null
}

export default function Stats({ projects }: Props) {
  const intl = useIntl()
  const formatFundingValue = (value: number) => intl.formatNumber(value, CURRENCY_FORMAT_OPTIONS as any)
  const endingThisWeekProjects = projects.filter((item) => {
    const finishAt = Time(item.contract?.finish_at)
    return finishAt.isAfter(Time()) && finishAt.isBefore(Time().add(1, 'week'))
  })

  // TODO: Also filter by current Q
  const currentProjects = useMemo(
    () =>
      projects.filter(
        ({ status }) =>
          status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
      ),
    [projects]
  )
  const currentBidProjects = useMemo(
    () => currentProjects.filter((item) => item.type === ProposalType.Bid),
    [currentProjects]
  )
  const currentGrantProjects = useMemo(
    () => currentProjects.filter((item) => item.type === ProposalType.Grant),
    [currentProjects]
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

  return (
    <div className="Stats">
      <MetricsCard
        variant="dark"
        category="ONGOING"
        title={`${currentProjects.length} projects`}
        description={`${endingThisWeekProjects.length} ending this week`}
      />
      <MetricsCard
        variant="dark"
        category="Project funding for Q3"
        title={`${formatFundingValue(totalBidFunding + totalGrantFunding)}`}
        description={`Grants: ${formattedTotalGrantFunding}; B&T: ${formattedTotalBidFunding}`}
      />
      <MetricsCard
        variant="dark"
        category="Opportunities"
        title={`1 tender open`}
        description="Bid submissions end in 15 days"
      />
    </div>
  )
}
