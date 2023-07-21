import React from 'react'
import { useIntl } from 'react-intl'

import classNames from 'classnames'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useProposalVotes from '../../../hooks/useProposalVotes'
import locations from '../../../utils/locations'
import Link from '../../Common/Typography/Link'
import ChevronRight from '../../Icon/ChevronRight'
import Username from '../../User/Username'

import './ProposalCard.css'

interface Props {
  proposal: ProposalAttributes
  highlight?: boolean
  isOverBudget?: boolean
  showBudget?: boolean
}

export default function ProposalCard({ proposal, highlight, isOverBudget, showBudget }: Props) {
  const t = useFormatMessage()
  const { id, title, user, start_at, finish_at, type, configuration } = proposal
  const { votes } = useProposalVotes(id)
  const dateText = useProposalDateText(start_at, finish_at)
  const { formatNumber } = useIntl()
  const hasBudget = type === ProposalType.Grant || type === ProposalType.Bid
  const budget = hasBudget && (configuration.size || configuration.funding)

  return (
    <Link
      className={classNames(
        'ProposalCard',
        highlight && (isOverBudget ? 'ProposalCard--overbudget' : 'ProposalCard--highlight')
      )}
      href={locations.proposal(id)}
    >
      <div className="ProposalCard__Container">
        <span className="ProposalCard__Title">{title}</span>
        <div className="ProposalCard__Details">
          <Username className="ProposalCard__Avatar" address={user} variant="avatar" size="mini" />
          <span className="ProposalCard__ByUser">{t('page.home.open_proposals.by_user')}</span>
          <Username className="ProposalCard__Username" address={user} variant="address" />
          <span>{' · '}</span>
          {showBudget && hasBudget && (
            <>
              <span className="ProposalCard__DetailsItem">
                {formatNumber(Number(budget), CURRENCY_FORMAT_OPTIONS as any)}
              </span>
              <span>{' · '}</span>
            </>
          )}
          <span className="ProposalCard__DetailsItem ProposalCard__DetailsOnlyDesktop">
            {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
          </span>
          <span>{' · '}</span>
          <span className="ProposalCard__DetailsItem">{dateText}</span>
        </div>
      </div>
      <div>
        <ChevronRight color="var(--black-400)" />
      </div>
    </Link>
  )
}
