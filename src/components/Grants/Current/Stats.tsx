import React from 'react'
import { useIntl } from 'react-intl'

import { ProjectStatus, SubtypeAlternativeOptions } from '../../../entities/Grant/types'
import { GrantWithUpdate } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useBudgetByCategory from '../../../hooks/useBudgetByCategory'
import Time from '../../../utils/date/Time'
import MetricsCard from '../../Home/MetricsCard'

import './Stats.css'

interface Props {
  projects: GrantWithUpdate[]
  status?: ProjectStatus | null
}

export default function Stats({ projects }: Props) {
  const intl = useIntl()
  const { total: totalBudget } = useBudgetByCategory(SubtypeAlternativeOptions.All)
  const endingThisWeekProjects = projects.filter((item) => {
    const finishAt = Time(item.contract?.finish_at)
    return finishAt.isAfter(Time()) && finishAt.isBefore(Time().add(1, 'week'))
  })

  return (
    <div className="Stats">
      <MetricsCard
        variant="dark"
        category="ONGOING"
        title={`${
          projects.filter(
            ({ status }) =>
              status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
          ).length
        } projects`}
        description={`${endingThisWeekProjects.length} ending this week`}
      />
      <MetricsCard
        variant="dark"
        category="Project funding for Q3"
        title={`${intl.formatNumber(totalBudget, CURRENCY_FORMAT_OPTIONS as any)}`}
        description="Grants: $1,235,678; B&T: $126,234"
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
