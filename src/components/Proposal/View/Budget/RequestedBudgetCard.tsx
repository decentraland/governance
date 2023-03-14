import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import DistributionBar, { DistributionItemProps } from '../../../Common/DistributionBar/DistributionBar'
import Pill, { PillColor } from '../../../Common/Pill'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './RequestedBudgetCard.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

export default function RequestedBudgetCard({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const totalCategoryBudget = categoryBudget?.total || 0
  const requestedBudget = proposal.configuration.size
  const allocatedCategoryBudget = categoryBudget.allocated
  const remainingBudget = categoryBudget.available - requestedBudget
  const remainingBudgetDisplayed = remainingBudget > 0 ? remainingBudget : 0
  const isOverBudget = remainingBudget < 0

  const items: DistributionItemProps[] = useMemo(() => {
    return [
      {
        value: allocatedCategoryBudget,
        className: TokenList.join(['AllocatedBudgetBar', isOverBudget && 'AllocatedBudgetBar--overbudget']),
      },
      {
        value: isOverBudget ? categoryBudget.available : requestedBudget,
        className: TokenList.join(['RequestedBudgetBar', isOverBudget && 'RequestedBudgetBar--overbudget']),
        selected: true,
      },
      {
        value: remainingBudgetDisplayed,
        className: 'RemainingBudgetBar',
      },
    ]
  }, [allocatedCategoryBudget, requestedBudget, remainingBudgetDisplayed, categoryBudget.available, isOverBudget])

  return (
    <GrantRequestSectionCard
      title={
        <div className="RequestedBudgetCard__Title">
          {t('page.proposal_detail.grant.requested_budget.title')}
          {isOverBudget && (
            <Pill style="outline" color={PillColor.Yellow} size={'small'}>
              {t('page.proposal_detail.grant.requested_budget.overbudget_pill')}
            </Pill>
          )}
        </div>
      }
      content={
        <div className="RequestedBudgetCard__Content">
          ${t('general.number', { value: proposal.configuration.size })}
          <DistributionBar items={items} total={totalCategoryBudget} />
        </div>
      }
      subtitle={
        !isOverBudget
          ? t('page.proposal_detail.grant.requested_budget.subtitle', {
              percentage: getFormattedPercentage(requestedBudget, totalCategoryBudget, 0),
            })
          : t('page.proposal_detail.grant.requested_budget.overbudget_subtitle', {
              amount: t('general.number', { value: categoryBudget.available }),
            })
      }
    />
  )
}
