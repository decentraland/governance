import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Sidebar } from 'decentraland-ui'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import DistributionBar, { DistributionItemProps } from '../../../Common/DistributionBar/DistributionBar'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './CompetingProposalsSidebar.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
  visible: boolean
}

export default function CompetingProposalsSidebar({ proposal, budget, visible }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const contestantsAmount = categoryBudget?.contestants.length || 0
  const requestedBudget = proposal.configuration.size
  const totalCategoryBudget = categoryBudget?.total || 0
  const allocatedBudget = categoryBudget?.allocated || 0
  const remainingTotalBudget = totalCategoryBudget - requestedBudget
  const remainingTotalBudgetDisplayed = remainingTotalBudget > 0 ? remainingTotalBudget : 0
  const contestedBudget = categoryBudget.contested || 0

  const items: DistributionItemProps[] = [
    {
      value: allocatedBudget,
      style: 'AllocatedBudgetBar',
    },
    {
      value: contestedBudget,
      style: 'ContestedBudgetBar',
    },
    {
      value: requestedBudget,
      style: 'ThisInitiativeBar',
      selected: true,
    },
    {
      value: remainingTotalBudgetDisplayed,
      style: 'TotalBudgetBar',
    },
  ]
  //TODO: internationalization
  return (
    <Sidebar
      className="CompetingProposalsSidebar"
      animation={'push'}
      direction={'right'}
      visible={visible}
      width={'very wide'}
    >
      <div className="CompetingProposalsSidebar__Content">
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">{'In-World Content Budget'}</span>
          <Close />
        </div>

        <GrantRequestSectionCard
          title="Contested"
          content={
            <div className="ContestedBudgetCard">
              <>${t('general.number', { value: proposal.configuration.size })}</>
              <DistributionBar items={items} total={totalCategoryBudget} />
            </div>
          }
          subtitle={''}
          // subtitle={t('page.proposal_detail.grant.requested_budget.subtitle', {
          //   percentage: getFormattedPercentage(requestedBudget, totalCategoryBudget, 0),
          // })}
        />
      </div>
    </Sidebar>
  )
}
