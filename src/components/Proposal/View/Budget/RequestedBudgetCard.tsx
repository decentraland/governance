import React from 'react'

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
  expectedBudget: BudgetWithContestants
}

export default function RequestedBudgetCard({ proposal, expectedBudget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const allocatedCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)]?.allocated || 0
  const totalCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)]?.total || 0
  const requestedBudget = proposal.configuration.size
  const remainingUncontestedBudget = totalCategoryBudget - requestedBudget - allocatedCategoryBudget
  const remainingBudgetDisplayed = remainingUncontestedBudget > 0 ? remainingUncontestedBudget : 0

  const items: DistributionItemProps[] = [
    {
      label: 'page.proposal_detail.grant.requested_budget.allocated',
      value: allocatedCategoryBudget,
      style: 'AllocatedBudgetBar',
    },
    {
      label: 'page.proposal_detail.grant.requested_budget.requested',
      value: requestedBudget,
      style: 'RequestedBudgetBar',
      selected: true,
    },
    {
      label: 'page.proposal_detail.grant.requested_budget.total',
      value: remainingBudgetDisplayed,
      style: 'RemainingBudgetBar',
    },
  ]

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
