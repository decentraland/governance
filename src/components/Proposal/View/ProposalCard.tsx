import { useIntl } from 'react-intl'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { getBudget } from '../../../entities/Proposal/utils'
import { CURRENCY_FORMAT_OPTIONS } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useProposalVotes from '../../../hooks/useProposalVotes'
import useWinningChoice from '../../../hooks/useWinningChoice'
import Username from '../../Common/Username'

import './ProposalCard.css'
import ProposalCardContainer from './ProposalCardContainer'

interface Props {
  proposal: ProposalAttributes
  highlight?: boolean
  isOverBudget?: boolean
  isDisabled?: boolean
  showBudget?: boolean
  showUser?: boolean
  showLeadingVP?: boolean
  showEndDate?: boolean
}

export default function ProposalCard({
  proposal,
  highlight,
  isOverBudget,
  showBudget,
  isDisabled,
  showUser = true,
  showLeadingVP,
  showEndDate,
}: Props) {
  const t = useFormatMessage()
  const { id, title, user, start_at, finish_at } = proposal
  const { votes } = useProposalVotes(id)
  const dateText = useProposalDateText(start_at, finish_at)
  const { formatNumber } = useIntl()
  const budget = getBudget(proposal)
  const { winningChoice, userChoice } = useWinningChoice(proposal)
  const highlightClassName = isOverBudget ? 'ProposalCard--overbudget' : 'ProposalCard--highlight'

  return (
    <ProposalCardContainer
      id={id}
      title={title}
      isDisabled={isDisabled}
      className={highlight ? highlightClassName : undefined}
    >
      <span className="ProposalCard__Details">
        {showUser && (
          <>
            <Username className="ProposalCard__Avatar" address={user} variant="avatar" size="mini" />
            <span className="ProposalCard__ByUser">{t('page.home.open_proposals.by_user')}</span>
            <Username className="ProposalCard__Username" address={user} variant="address" />
            <span>{' · '}</span>
          </>
        )}
        {showBudget && budget && (
          <>
            <span>{formatNumber(budget, CURRENCY_FORMAT_OPTIONS as any)}</span>
            <span>{' · '}</span>
          </>
        )}
        <span>
          {showLeadingVP
            ? t('page.home.open_proposals.leading_vp', {
                total: formatNumber(winningChoice.power),
                choice: winningChoice.choice,
              })
            : t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
        </span>
        {showEndDate && (
          <>
            <span>{' · '}</span>
            <span>{dateText}</span>
          </>
        )}
      </span>
      {userChoice && (
        <span>
          {t('page.proposal_detail.your_vote_label')}
          <strong>{userChoice}</strong>
        </span>
      )}
    </ProposalCardContainer>
  )
}
