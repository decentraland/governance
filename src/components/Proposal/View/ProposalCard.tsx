import React from 'react'

import classNames from 'classnames'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useProposalVotes from '../../../hooks/useProposalVotes'
import locations from '../../../modules/locations'
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
      href={locations.proposal(id)}
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
