import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import DistributionBar, { DistributionItemProps } from '../../../Common/DistributionBar/DistributionBar'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './RequestedBudgetCard.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function RequestedBudgetCard({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const totalCategoryBudget = budget.categories[snakeCase(grantCategory)]?.total || 0
  const requestedBudget = proposal.configuration.size
  const remainingTotalBudget = totalCategoryBudget - requestedBudget
  const remainingTotalBudgetDisplayed = remainingTotalBudget > 0 ? remainingTotalBudget : 0

  const items: DistributionItemProps[] = useMemo(() => {
    return [
      {
        value: requestedBudget,
        className: 'RequestedBudgetBar',
        selected: true,
      },
      {
        value: remainingTotalBudgetDisplayed,
        className: 'TotalBudgetBar',
      },
    ]
  }, [requestedBudget, remainingTotalBudgetDisplayed])

  return (
    <GrantRequestSectionCard
      title={t('page.proposal_detail.grant.requested_budget.title')}
      content={
        <div className="RequestedBudgetCard">
          <>${t('general.number', { value: proposal.configuration.size })}</>
          <DistributionBar items={items} total={totalCategoryBudget} />
        </div>
      }
      subtitle={t('page.proposal_detail.grant.requested_budget.subtitle', {
        percentage: getFormattedPercentage(requestedBudget, totalCategoryBudget, 0),
      })}
    />
  )
}
