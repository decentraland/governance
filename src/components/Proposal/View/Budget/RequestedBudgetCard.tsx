import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import snakeCase from 'lodash/snakeCase'

import { ExpectedBudget } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import DistributionBar, { DistributionItemProps } from '../../../Common/DistributionBar/DistributionBar'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './RequestedBudgetCard.css'

interface Props {
  proposal: ProposalAttributes
  expectedBudget: ExpectedBudget
}

export default function RequestedBudgetCard({ proposal, expectedBudget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const allocatedCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)].allocated
  const totalCategoryBudget = expectedBudget.categories[snakeCase(grantCategory)].total
  const requestedBudget = proposal.configuration.size
  const remainingUncontestedBudget = totalCategoryBudget - requestedBudget - allocatedCategoryBudget
  const remainingBudgetDisplayed = remainingUncontestedBudget > 0 ? remainingUncontestedBudget : 0

  //TODO: internationalization
  const items: DistributionItemProps[] = [
    { label: 'Allocated Budget', value: allocatedCategoryBudget, style: 'AllocatedBudgetBar' },
    { label: 'Requested Budget', value: requestedBudget, style: 'RequestedBudgetBar', selected: true },
    { label: 'Remaining Budget', value: remainingBudgetDisplayed, style: 'RemainingBudgetBar' },
  ]

  return (
    <GrantRequestSectionCard
      title={'Requesting'}
      content={
        <div className="RequestedBudgetCard">
          <>${t('general.number', { value: proposal.configuration.size })}</>
          <DistributionBar items={items} total={totalCategoryBudget} />
        </div>
      }
      subtitle={`${getFormattedPercentage(requestedBudget, totalCategoryBudget, 0)} of quarterly category budget`}
    />
  )
}
