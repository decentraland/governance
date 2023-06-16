import React from 'react'

import { Link } from '@reach/router'
import classNames from 'classnames'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useProposalVotes from '../../../hooks/useProposalVotes'
import locations from '../../../utils/locations'
import ChevronRight from '../../Icon/ChevronRight'
import Username from '../../User/Username'

import './ProposalCard.css'

interface Props {
  proposal: ProposalAttributes
  highlight?: boolean
  isOverBudget?: boolean
}

export default function ProposalCard({ proposal, highlight, isOverBudget }: Props) {
  const t = useFormatMessage()
  const { id, title, user, start_at, finish_at } = proposal
  const { votes } = useProposalVotes(id)
  const dateText = useProposalDateText(start_at, finish_at)

  return (
    <Link
      className={classNames(
        'ProposalCard',
        highlight && (isOverBudget ? 'ProposalCard--overbudget' : 'ProposalCard--highlight')
      )}
      to={locations.proposal(id)}
    >
      <div className="ProposalCard__Container">
        <span className="ProposalCard__Title">{title}</span>
        <div className="ProposalCard__Details">
          <Username className="ProposalCard__Avatar" address={user} variant="avatar" size="mini" />
          <span className="ProposalCard__ByUser">{t('page.home.open_proposals.by_user')}</span>
          <Username className="ProposalCard__Username" address={user} variant="address" />
          <span>{' · '}</span>
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
