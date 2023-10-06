import { useMemo } from 'react'

import classNames from 'classnames'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants, CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes, ProposalStatus } from '../../../../entities/Proposal/types'
import { getFormattedPercentage } from '../../../../helpers'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import DistributionBar from '../../../Common/DistributionBar/DistributionBar'
import { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'
import Pill, { PillColor } from '../../../Common/Pill'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './RequestedBudgetCard.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
}

function requestedAndTotalItems(requestedBudget: number, totalCategoryBudget: number) {
  return [
    {
      value: requestedBudget,
      className: 'RequestedBudgetBar',
      selected: true,
    },
    {
      value: totalCategoryBudget - requestedBudget,
      className: 'RemainingBudgetBar',
    },
  ]
}

function allocatedRequestedAndRemainingItems(
  allocatedCategoryBudget: number,
  isOverBudget: boolean,
  categoryBudget: CategoryBudgetWithContestants,
  requestedBudget: number,
  remainingBudgetDisplayed: number
) {
  return [
    {
      value: allocatedCategoryBudget,
      className: classNames('AllocatedBudgetBar', isOverBudget && 'AllocatedBudgetBar--overbudget'),
    },
    {
      value: isOverBudget ? categoryBudget.available : requestedBudget,
      className: classNames('RequestedBudgetBar', isOverBudget && 'RequestedBudgetBar--overbudget'),
      selected: true,
    },
    {
      value: remainingBudgetDisplayed,
      className: 'RemainingBudgetBar',
    },
  ]
}

export default function RequestedBudgetCard({ proposal, budget }: Props) {
  const t = useFormatMessage()
  const isProposalActive = proposal.status === ProposalStatus.Active
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const totalCategoryBudget = categoryBudget?.total || 0
  const requestedBudget = proposal.configuration.size
  const allocatedCategoryBudget = categoryBudget.allocated
  const remainingBudget = categoryBudget.available - requestedBudget
  const remainingBudgetDisplayed = remainingBudget > 0 ? remainingBudget : 0
  const isOverBudget = remainingBudget < 0

  const items: DistributionBarItemProps[] = useMemo(() => {
    return isProposalActive
      ? allocatedRequestedAndRemainingItems(
          allocatedCategoryBudget,
          isOverBudget,
          categoryBudget,
          requestedBudget,
          remainingBudgetDisplayed
        )
      : requestedAndTotalItems(requestedBudget, totalCategoryBudget)
  }, [
    isProposalActive,
    allocatedCategoryBudget,
    isOverBudget,
    categoryBudget,
    requestedBudget,
    remainingBudgetDisplayed,
    totalCategoryBudget,
  ])

  return (
    <GrantRequestSectionCard
      title={
        <div className="RequestedBudgetCard__Title">
          {t(`page.proposal_detail.grant.requested_budget.${isProposalActive ? 'active_title' : 'finished_title'}`)}
          {isProposalActive && isOverBudget && (
            <Pill style="outline" color={PillColor.Yellow} size="sm">
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
        isProposalActive && isOverBudget
          ? t('page.proposal_detail.grant.requested_budget.overbudget_subtitle', {
              amount: t('general.number', { value: categoryBudget.available }),
            })
          : t('page.proposal_detail.grant.requested_budget.subtitle', {
              percentage: getFormattedPercentage(requestedBudget, totalCategoryBudget),
            })
      }
    />
  )
}
