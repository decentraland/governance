import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Sidebar } from 'decentraland-ui'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants, CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import DistributionBar, { DistributionItemProps } from '../../../Common/DistributionBar/DistributionBar'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './CompetingProposalsSidebar.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
  visible: boolean
}

function getBarItems(
  t: <V extends {}>(id?: string | null, values?: V | undefined) => string,
  proposal: ProposalAttributes,
  categoryBudget: CategoryBudgetWithContestants
) {
  const totalCategoryBudget = categoryBudget?.total || 0
  const requestedBudget = proposal.configuration.size
  const remainingTotalBudget = totalCategoryBudget - requestedBudget
  const remainingTotalBudgetDisplayed = remainingTotalBudget > 0 ? remainingTotalBudget : 0
  const allocatedBudget = categoryBudget?.allocated || 0
  const contestedBudget = categoryBudget.contested || 0

  const items: DistributionItemProps[] = [
    {
      value: allocatedBudget,
      style: 'AllocatedBudgetBar',
    },
  ]
  categoryBudget?.contestants.forEach((contestant) => {
    if(contestant.id !== proposal.id){
      items.push({
        value: contestant.size,
        style: 'ContestedBudgetBar',
        popupContent: {
          title: contestant.title,
          content: <span>{`$${t('general.number', { value: contestant.size })}`}</span>,
        },
      })
    }
  })

  items.push({
    value: requestedBudget,
    style: 'ThisInitiativeBar',
    selected: true,
    popupContent: {
      title: proposal.title,
      content: <span>{`$${t('general.number', { value: requestedBudget })}`}</span>,
    },
  })

  items.push({
    value: remainingTotalBudgetDisplayed,
    style: 'TotalBudgetBar',
  })
  return items
}

export default function CompetingProposalsSidebar({ proposal, budget, visible }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const totalCategoryBudget = categoryBudget?.total || 0
  const items = getBarItems(t, proposal, categoryBudget)

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
              <DistributionBar items={items} total={totalCategoryBudget} className="ContestedBudget__DistributionBar" />
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