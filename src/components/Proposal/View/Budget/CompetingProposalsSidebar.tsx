import React, { useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import snakeCase from 'lodash/snakeCase'
import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import { BudgetWithContestants, CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { toNewGrantCategory } from '../../../../entities/QuarterCategoryBudget/utils'
import { getFormattedPercentage } from '../../../../helpers'
import { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'
import Pill, { PillColor } from '../../../Common/Pill'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import CompetingProposal from './CompetingProposal'
import './CompetingProposalsSidebar.css'
import ContestedBudgetDistributionBar from './ContestedBudgetDistributionBar'

/* eslint-disable @typescript-eslint/ban-types */
function getContestingProposalsItems(
  t: <V extends {}>(id?: string | null, values?: V | undefined) => string,
  proposal: ProposalAttributes,
  categoryBudget: CategoryBudgetWithContestants,
  highlightedContestant: string | null,
  setHighlightedContestant: (value: ((prevState: string | null) => string | null) | string | null) => void,
  isOverBudget: boolean
) {
  const items: DistributionBarItemProps[] = []
  categoryBudget?.contestants.forEach((contestant) => {
    if (contestant.id !== proposal.id) {
      items.push({
        value: contestant.size,
        className: isOverBudget ? 'ContestedBudgetOverbudgetBar' : 'ContestedBudgetBar',
        selected: highlightedContestant === contestant.id,
        onHover: (e: React.MouseEvent<unknown>) => {
          setHighlightedContestant(contestant.id)
        },
        onBlur: () => {
          setHighlightedContestant(null)
        },
        popupContent: {
          title: contestant.title,
          content: <span>{`$${t('general.number', { value: contestant.size })}`}</span>,
          position: 'bottom center',
        },
      })
    }
  })
  return items
}

function getBarItems(
  t: <V extends {}>(id?: string | null, values?: V | undefined) => string,
  proposal: ProposalAttributes,
  categoryBudget: CategoryBudgetWithContestants,
  highlightedContestant: string | null,
  setHighlightedContestant: (value: ((prevState: string | null) => string | null) | string | null) => void
) {
  const contestedBudget = categoryBudget.contested || 0
  const requestedBudget = proposal.configuration.size
  const availableBudget = categoryBudget?.available || 0
  const uncontestedTotalBudget = availableBudget - contestedBudget
  const isOverBudget = uncontestedTotalBudget <= 0
  const uncontestedTotalBudgetDisplayed = !isOverBudget ? uncontestedTotalBudget : 0
  const allocatedBudget = categoryBudget?.allocated || 0

  const allocatedBudgetItem = {
    value: allocatedBudget,
    className: 'GrantedFundsBar',
  }

  const contestingProposalsItems = getContestingProposalsItems(
    t,
    proposal,
    categoryBudget,
    highlightedContestant,
    setHighlightedContestant,
    isOverBudget
  )

  const requestedBudgetItem = {
    value: requestedBudget,
    className: isOverBudget ? 'ThisInitiativeOverbudgetBar' : 'ThisInitiativeBar',
    selected: !highlightedContestant,
    popupContent: {
      title: t('page.proposal_detail.grant.competing_proposals.sidebar.this_initiative_title'),
      content: <span>{`$${t('general.number', { value: requestedBudget })}`}</span>,
    },
  }

  const uncontestedTotalBudgetItem = isOverBudget
    ? undefined
    : {
        value: uncontestedTotalBudgetDisplayed,
        className: 'UncontestedBudgetBar',
      }

  const availableOverBudgetItem = isOverBudget
    ? {
        value: availableBudget,
        className: 'AvailableOverBudgetBar',
      }
    : undefined

  return {
    allocatedBudgetItem,
    contestingProposalsItems,
    availableOverBudgetItem,
    requestedBudgetItem,
    uncontestedTotalBudgetItem,
    isOverBudget,
  }
}

/* eslint-disable @typescript-eslint/ban-types */

type Props = {
  proposal: ProposalAttributes
  budget: BudgetWithContestants
  isSidebarVisible: boolean
  onClose: () => void
}

export default function CompetingProposalsSidebar({ proposal, budget, isSidebarVisible, onClose }: Props) {
  const t = useFormatMessage()
  const grantCategory = proposal.configuration.category
  const categoryBudget = budget.categories[snakeCase(grantCategory)]
  const totalCategoryBudget = categoryBudget?.total || 0
  const contestedBudget = categoryBudget.contested || 0
  const availableBudget = categoryBudget?.available || 0
  const uncontestedTotalBudget = availableBudget - contestedBudget
  const uncontestedTotalBudgetDisplayed = uncontestedTotalBudget > 0 ? uncontestedTotalBudget : 0
  const contestants = categoryBudget.contestants.filter((contestant) => contestant.id !== proposal.id)
  const [highlightedContestant, setHighlightedContestant] = useState<string | null>(null)
  const {
    allocatedBudgetItem,
    contestingProposalsItems,
    availableOverBudgetItem,
    requestedBudgetItem,
    uncontestedTotalBudgetItem,
    isOverBudget,
  } = useMemo(() => {
    return getBarItems(t, proposal, categoryBudget, highlightedContestant, setHighlightedContestant)
  }, [categoryBudget, highlightedContestant, proposal, t])
  const [showPopups, setShowPopups] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.querySelector('.CompetingProposalsSidebar')
      if (sidebar && !sidebar.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isSidebarVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarVisible, onClose])

  function handleClose(e: React.MouseEvent<unknown>) {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  return (
    <Sidebar
      className="CompetingProposalsSidebar"
      animation={'push'}
      onShow={() => {
        setShowPopups(true)
      }}
      onHide={() => {
        setShowPopups(false)
      }}
      direction={'right'}
      visible={isSidebarVisible}
      width={'very wide'}
    >
      <div className="CompetingProposalsSidebar__Content">
        <div className="CompetingProposalsSidebar__TitleContainer">
          <span className="CompetingProposalsSidebar__Title">
            {t('page.proposal_detail.grant.competing_proposals.sidebar.title', {
              category: toNewGrantCategory(grantCategory),
            })}
          </span>
          <Close onClick={handleClose} />
        </div>

        <GrantRequestSectionCard
          title={
            <>
              {t('page.proposal_detail.grant.competing_proposals.sidebar.competing_proposals_bar_title')}
              {isOverBudget && (
                <Pill style="outline" color={PillColor.Yellow} size={'small'}>
                  {t('page.proposal_detail.grant.requested_budget.overbudget_pill')}
                </Pill>
              )}
            </>
          }
          content={
            <div className="ContestedBudgetCard">
              <div className="ContestedBudgetCard__Label">
                <div
                  className={TokenList.join([
                    'ContestedBudgetCard__Legend',
                    isOverBudget ? 'ContestedOverbudgetLegend' : 'ContestedLegend',
                  ])}
                />
                <span className="ContestedLabel">${t('general.number', { value: categoryBudget.contested })}</span>
                <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                  categoryBudget.contested,
                  categoryBudget.total,
                  0
                )})`}</span>
              </div>
              <ContestedBudgetDistributionBar
                allocatedBudgetItem={allocatedBudgetItem}
                contestingProposalsItems={contestingProposalsItems}
                availableOverBudgetItem={availableOverBudgetItem}
                requestedBudgetItem={requestedBudgetItem}
                uncontestedTotalBudgetItem={uncontestedTotalBudgetItem}
                total={isOverBudget ? categoryBudget.allocated + categoryBudget.contested : totalCategoryBudget}
                showPopups={showPopups}
              />
            </div>
          }
          subtitle={
            <div className="ContestedBudgetCard__Row">
              <div className="ContestedBudgetCard__Label">
                <div className={TokenList.join(['ContestedBudgetCard__Legend', 'GrantedFundsLegend'])} />
                <span className="GrantedFundsLabel">
                  {t('page.proposal_detail.grant.competing_proposals.sidebar.granted_funds', {
                    amount: t('general.number', { value: categoryBudget.allocated }),
                  })}
                </span>
                <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                  categoryBudget.allocated,
                  categoryBudget.total,
                  0
                )})`}</span>
              </div>
              {uncontestedTotalBudgetDisplayed > 0 && (
                <div className="ContestedBudgetCard__Label">
                  <div className={TokenList.join(['ContestedBudgetCard__Legend', 'UncontestedFundsLegend'])} />
                  <span className="GrantedFundsLabel">
                    {t('page.proposal_detail.grant.competing_proposals.sidebar.uncontested_funds', {
                      amount: t('general.number', { value: uncontestedTotalBudgetDisplayed }),
                    })}
                  </span>
                  <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                    uncontestedTotalBudgetDisplayed,
                    categoryBudget.total,
                    0
                  )})`}</span>
                </div>
              )}
              {isOverBudget && (
                <div className="ContestedBudgetCard__Label">
                  <div className={TokenList.join(['ContestedBudgetCard__Legend', 'AvailableOverBudgetLegend'])} />
                  <span className="GrantedFundsLabel">
                    {t('page.proposal_detail.grant.competing_proposals.sidebar.available_funds', {
                      amount: t('general.number', { value: availableBudget }),
                    })}
                  </span>
                  <span className="GrantedFundsPercentageLabel">{`(${getFormattedPercentage(
                    availableBudget,
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
          <span className="CompetingProposalsSidebar__Title">
            {t('page.proposal_detail.grant.competing_proposals.sidebar.other_initiatives_title', {
              category: toNewGrantCategory(grantCategory),
            })}
          </span>
        </div>

        {contestants.map((contestant, index) => (
          <div
            className="ContestedBudgetCard__Row"
            key={`contestant-${index}`}
            onMouseEnter={() => setHighlightedContestant(contestant.id)}
            onMouseLeave={() => setHighlightedContestant(null)}
          >
            <CompetingProposal
              proposal={contestant}
              highlight={highlightedContestant === contestant.id}
              isOverBudget={isOverBudget}
            />
          </div>
        ))}
      </div>
    </Sidebar>
  )
}
