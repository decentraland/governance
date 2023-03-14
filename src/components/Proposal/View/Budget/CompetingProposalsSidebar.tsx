import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Sidebar } from 'decentraland-ui'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import snakeCase from 'lodash/snakeCase'

import { BudgetWithContestants, CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { toNewGrantCategory } from '../../../../entities/QuarterCategoryBudget/utils'
import { getFormattedPercentage } from '../../../../helpers'
import DistributionBar from '../../../Common/DistributionBar/DistributionBar'
import { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import CompetingProposal from './CompetingProposal'
import './CompetingProposalsSidebar.css'

interface Props {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
  visible: boolean
}

//TODO: consider case when requested is over available!
function getBarItems(
  t: <V extends {}>(id?: string | null, values?: V | undefined) => string,
  proposal: ProposalAttributes,
  categoryBudget: CategoryBudgetWithContestants,
  highlightedContestant: string,
  setHighlightedContestant: (value: ((prevState: string) => string) | string) => void
) {
  const contestedBudget = categoryBudget.contested || 0
  const requestedBudget = proposal.configuration.size
  const uncontestedTotalBudget = (categoryBudget?.available || 0) - contestedBudget
  const uncontestedTotalBudgetDisplayed = uncontestedTotalBudget > 0 ? uncontestedTotalBudget : 0
  const allocatedBudget = categoryBudget?.allocated || 0

  const items: DistributionBarItemProps[] = [
    {
      value: allocatedBudget,
      className: 'GrantedFundsBar',
    },
  ]
  categoryBudget?.contestants.forEach((contestant) => {
    if (contestant.id !== proposal.id) {
      items.push({
        value: contestant.size,
        className: 'ContestedBudgetBar',
        onHover: (e: React.MouseEvent<unknown>) => {
          e.preventDefault()
          setHighlightedContestant(contestant.id)
        },
        onBlur: () => {
          setHighlightedContestant('')
        },
        popupContent: {
          title: contestant.title,
          content: <span>{`$${t('general.number', { value: contestant.size })}`}</span>,
        },
      })
    }
  })

  items.push({
    value: requestedBudget,
    className: 'ThisInitiativeBar',
    selected: highlightedContestant === '',
    popupContent: {
      title: proposal.title,
      content: <span>{`$${t('general.number', { value: requestedBudget })}`}</span>,
    },
  })

  items.push({
    value: uncontestedTotalBudgetDisplayed,
    className: 'UncontestedBudgetBar',
  })
  return items
}

export default function CompetingProposalsSidebar({ proposal, budget, visible }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const totalCategoryBudget = categoryBudget?.total || 0
  const contestedBudget = categoryBudget.contested || 0
  const uncontestedTotalBudget = (categoryBudget?.available || 0) - contestedBudget
  const uncontestedTotalBudgetDisplayed = uncontestedTotalBudget > 0 ? uncontestedTotalBudget : 0
  const contestants = categoryBudget.contestants.filter((contestant) => contestant.id !== proposal.id)
  const [highlightedContestant, setHighlightedContestant] = useState('')
  const items = getBarItems(t, proposal, categoryBudget, highlightedContestant, setHighlightedContestant)

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
          <span className="CompetingProposalsSidebar__Title">{`${toNewGrantCategory(grantCategory)} Budget`}</span>
          <Close />
        </div>

        <GrantRequestSectionCard
          title="Contested"
          content={
            <div className="ContestedBudgetCard">
              <div className="ContestedBudgetCard__Label">
                <div className={TokenList.join(['ContestedBudgetCard__Legend', 'ContestedLegend'])} />
                <span className="ContestedLabel">${t('general.number', { value: categoryBudget.contested })}</span>
                <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                  categoryBudget.contested,
                  categoryBudget.total,
                  0
                )})`}</span>
              </div>
              <DistributionBar items={items} total={totalCategoryBudget} className="ContestedBudget__DistributionBar" />
            </div>
          }
          subtitle={
            <div className="ContestedBudgetCard__Row">
              <div className="ContestedBudgetCard__Label">
                <div className={TokenList.join(['ContestedBudgetCard__Legend', 'GrantedFundsLegend'])} />
                <span className="GrantedFundsLabel">{`Granted Funds $${t('general.number', {
                  value: categoryBudget.allocated,
                })}`}</span>
                <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                  categoryBudget.allocated,
                  categoryBudget.total,
                  0
                )})`}</span>
              </div>
              {uncontestedTotalBudgetDisplayed > 0 && (
                <div className="ContestedBudgetCard__Label">
                  <div className={TokenList.join(['ContestedBudgetCard__Legend', 'UncontestedFundsLegend'])} />
                  <span className="GrantedFundsLabel">{`Uncontested $${t('general.number', {
                    value: uncontestedTotalBudgetDisplayed,
                  })}`}</span>
                  <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                    uncontestedTotalBudgetDisplayed,
                    categoryBudget.total,
                    0
                  )})`}</span>
                </div>
              )}
            </div>
          }
        />
      </div>

      <div className="CompetingProposalsSidebar__Content">
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">{`Other ${toNewGrantCategory(
            grantCategory
          )} Initiatives`}</span>
        </div>

        {contestants.map((contestant, index) => (
          <div className="ContestedBudgetCard__Row" key={`contestant-${index}`}>
            <CompetingProposal proposal={contestant} highlight={highlightedContestant === contestant.id} />
          </div>
        ))}
      </div>
    </Sidebar>
  )
}