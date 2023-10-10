import { useIntl } from 'react-intl'

import classNames from 'classnames'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { getBudget, proposalUrl } from '../../../entities/Proposal/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useProposalVotes from '../../../hooks/useProposalVotes'
import useWinningChoice from '../../../hooks/useWinningChoice'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ChevronRight from '../../Icon/ChevronRight'

import './ProposalCard.css'

interface Props {
  proposal: ProposalAttributes
  highlight?: boolean
  isOverBudget?: boolean
  showBudget?: boolean
  isDisabled?: boolean
  hideUser?: boolean
  showLeadingVP?: boolean
  hideEndDate?: boolean
}

export default function ProposalCard({
  proposal,
  highlight,
  isOverBudget,
  showBudget,
  isDisabled,
  hideUser,
  showLeadingVP,
  hideEndDate,
}: Props) {
  const t = useFormatMessage()
  const { id, title, user, start_at, finish_at } = proposal
  const { votes } = useProposalVotes(id)
  const dateText = useProposalDateText(start_at, finish_at)
  const { formatNumber } = useIntl()
  const budget = getBudget(proposal)
  const { winningChoice, userChoice } = useWinningChoice(proposal)

  return (
    <Link
      className={classNames(
        'ProposalCard',
        highlight && (isOverBudget ? 'ProposalCard--overbudget' : 'ProposalCard--highlight'),
        isDisabled && 'ProposalCard--disabled'
      )}
      href={proposalUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="ProposalCard__Container">
        <span className="ProposalCard__Title">{title}</span>
        <div className="ProposalCard__DetailsContainer">
          <span className="ProposalCard__Details">
            {!hideUser && (
              <>
                <Username className="ProposalCard__Avatar" address={user} variant="avatar" size="mini" />
                <span className="ProposalCard__ByUser">{t('page.home.open_proposals.by_user')}</span>
                <Username className="ProposalCard__Username" address={user} variant="address" />
                <span>{' · '}</span>
              </>
            )}
            {showBudget && budget && (
              <>
                <span className="ProposalCard__DetailsItem">
                  {formatNumber(budget, CURRENCY_FORMAT_OPTIONS as any)}
                </span>
                <span>{' · '}</span>
              </>
            )}
            <span className="ProposalCard__DetailsItem ProposalCard__DetailsOnlyDesktop">
              {showLeadingVP
                ? t('page.home.open_proposals.leading_vp', {
                    total: formatNumber(winningChoice.power),
                    choice: winningChoice.choice,
                  })
                : t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
            </span>
            {!hideEndDate && (
              <>
                <span>{' · '}</span>
                <span className="ProposalCard__DetailsItem">{dateText}</span>
              </>
            )}
          </span>
          {userChoice && (
            <span>
              {t('page.proposal_detail.your_vote_label')}
              <strong>{userChoice}</strong>
            </span>
          )}
        </div>
      </div>
      <div>
        <ChevronRight color="var(--black-400)" />
      </div>
    </Link>
  )
}
