import { useMemo } from 'react'
import { IntlShape, useIntl } from 'react-intl'

import classNames from 'classnames'

import { CategoryBudgetWithContestants } from '../../../../entities/Budget/types'
import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS, getFormattedPercentage } from '../../../../helpers'
import useFormatMessage, { FormatMessageFunction } from '../../../../hooks/useFormatMessage'
import { DistributionBarItemProps } from '../../../Common/DistributionBar/DistributionBarItem'
import { GrantRequestSectionCard } from '../../../GrantRequest/GrantRequestSectionCard'

import './ContestedBudgetCard.css'
import ContestedBudgetDistributionBar from './ContestedBudgetDistributionBar'
import ContestedBudgetCardLabel from './ContestedBudgetLabel'
import ContestedBudgetSubLabel from './ContestedBudgetSubLabel'

function getContestingProposalsItems(
  t: FormatMessageFunction,
  intl: IntlShape,
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
        className: isOverBudget ? 'CompetingProposalOverbudgetBar' : 'CompetingProposalBudgetBar',
        selected: highlightedContestant === contestant.id,
        onHover: () => {
          setHighlightedContestant(contestant.id)
        },
        onBlur: () => {
          setHighlightedContestant(null)
        },
        popupContent: {
          title: contestant.title,
          content: <span>{intl.formatNumber(contestant.size, CURRENCY_FORMAT_OPTIONS)}</span>,
          position: 'bottom center',
        },
      })
    }
  })
  return items
}

function getBarItems(
  t: FormatMessageFunction,
  intl: IntlShape,
  proposal: ProposalAttributes,
  categoryBudget: CategoryBudgetWithContestants,
  highlightedContestant: string | null,
  setHighlightedContestant: (value: ((prevState: string | null) => string | null) | string | null) => void
) {
  const contestedBudget = categoryBudget.contested || 0
  const requestedBudget = proposal.configuration.size
  const availableBudget = categoryBudget?.available || 0
  const uncontestedTotalBudget = availableBudget - contestedBudget
  const isOverBudget = uncontestedTotalBudget < 0
  const uncontestedTotalBudgetDisplayed = !isOverBudget ? uncontestedTotalBudget : 0
  const allocatedBudget = categoryBudget?.allocated || 0

  const allocatedBudgetItem = {
    value: allocatedBudget,
    className: classNames('GrantedFundsBar', isOverBudget && 'GrantedFundsBarOverbudget'),
  }

  const contestingProposalsItems = getContestingProposalsItems(
    t,
    intl,
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
      content: <span>{intl.formatNumber(requestedBudget, CURRENCY_FORMAT_OPTIONS)}</span>,
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
        className: 'AvailableOverBudget__Available',
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

interface Props {
  proposal: ProposalAttributes
  categoryBudget: CategoryBudgetWithContestants
  highlightedContestant: string | null
  setHighlightedContestant: React.Dispatch<React.SetStateAction<string | null>>
  showPopups: boolean
}

export default function ContestedBudgetCard({
  proposal,
  categoryBudget,
  highlightedContestant,
  setHighlightedContestant,
  showPopups,
}: Props) {
  const t = useFormatMessage()
  const intl = useIntl()
  const totalCategoryBudget = categoryBudget?.total || 0
  const contestedBudget = categoryBudget.contested || 0
  const availableBudget = categoryBudget?.available || 0
  const uncontestedTotalBudget = availableBudget - contestedBudget
  const uncontestedTotalBudgetDisplayed = uncontestedTotalBudget > 0 ? uncontestedTotalBudget : 0
  const {
    allocatedBudgetItem,
    contestingProposalsItems,
    availableOverBudgetItem,
    requestedBudgetItem,
    uncontestedTotalBudgetItem,
    isOverBudget,
  } = useMemo(() => {
    return getBarItems(t, intl, proposal, categoryBudget, highlightedContestant, setHighlightedContestant)
  }, [categoryBudget, highlightedContestant, proposal, t, intl])

  return (
    <GrantRequestSectionCard
      title={
        <div className="ContestedBudgetCard__Title">
          <ContestedBudgetCardLabel
            title={t('page.proposal_detail.grant.competing_proposals.sidebar.competing_proposals_bar_title')}
            legend={isOverBudget ? 'contested_overbudget' : 'contested'}
            amount={contestedBudget}
          />
          {isOverBudget && (
            <ContestedBudgetCardLabel
              title={t('page.proposal_detail.grant.competing_proposals.sidebar.available_funds_label')}
              legend={'available_overbudget'}
              amount={availableBudget}
              percentage={getFormattedPercentage(availableBudget, categoryBudget.total, 0)}
            />
          )}
        </div>
      }
      content={
        <div className="ContestedBudgetCard__Content">
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
          <ContestedBudgetSubLabel
            title={t('page.proposal_detail.grant.competing_proposals.sidebar.granted_funds_label')}
            amount={categoryBudget.allocated}
            legend={'granted'}
            percentage={getFormattedPercentage(categoryBudget.allocated, categoryBudget.total, 0)}
          />
          {uncontestedTotalBudgetDisplayed > 0 && (
            <ContestedBudgetSubLabel
              title={t('page.proposal_detail.grant.competing_proposals.sidebar.uncontested_funds_label')}
              amount={uncontestedTotalBudgetDisplayed}
              legend={'uncontested'}
              percentage={getFormattedPercentage(uncontestedTotalBudgetDisplayed, categoryBudget.total, 0)}
            />
          )}
        </div>
      }
    />
  )
}
