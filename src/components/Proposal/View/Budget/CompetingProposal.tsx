import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import isEmpty from 'lodash/isEmpty'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import { calculateResult } from '../../../../entities/Votes/utils'
import useProposalVotes from '../../../../hooks/useProposalVotes'
import locations from '../../../../modules/locations'
import ChevronRight from '../../../Icon/ChevronRight'
import Username from '../../../User/Username'

import './CompetingProposal.css'

interface Props {
  proposal: ProposalAttributes
  highlight: boolean
}

const CompetingProposal = ({ proposal, highlight }: Props) => {
  const t = useFormatMessage()
  const { title, user, finish_at } = proposal
  const { votes } = useProposalVotes(proposal.id)
  const [account] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const hasVote = !!account && !isEmpty(votes?.[account])
  const results = useMemo(
    () => calculateResult(proposal?.snapshot_proposal?.choices || [], votes || {}),
    [proposal?.snapshot_proposal?.choices, votes]
  )
  const vpInFavor = results[0].power || 0

  const dateText = t(`page.home.open_proposals.${Time().isBefore(Time(finish_at)) ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })

  return (
    <Link
      className={TokenList.join(['CompetingProposal', highlight && 'CompetingProposal--highlight'])}
      href={locations.proposal(proposal.id)}
    >
      <div className="CompetingProposal__Container">
        <span className="CompetingProposal__Title">{title}</span>
        <div className="CompetingProposal__Details">
          <Username className="CompetingProposal__Avatar" address={user} variant="avatar" size="mini" />
          <span className="CompetingProposal__ByUser">{t('page.home.open_proposals.by_user')}</span>
          <Username className="CompetingProposal__Username" address={user} variant="address" />
          <span>{' · '}</span>
          <span className="CompetingProposal__DetailsItem CompetingProposal__DetailsOnlyDesktop">
            {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
          </span>
          <span>{' · '}</span>
          <span className="CompetingProposal__DetailsItem">{dateText}</span>
        </div>
      </div>
      <ChevronRight color="var(--black-400)" />
    </Link>
  )
}

export default CompetingProposal