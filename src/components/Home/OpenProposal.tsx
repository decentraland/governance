import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useProposalComments from '../../hooks/useProposalComments'
import useProposalVotes from '../../hooks/useProposalVotes'
import locations from '../../modules/locations'
import CategoryPill from '../Category/CategoryPill'
import ChevronRight from '../Icon/ChevronRight'
import Username from '../User/Username'

import './OpenProposal.css'

interface Props {
  proposal: ProposalAttributes
}

const OpenProposal = ({ proposal }: Props) => {
  const t = useFormatMessage()
  const { title, user, finish_at } = proposal
  const hasVote = false // TODO: Remove hardcoded value
  const { comments } = useProposalComments(proposal.id)
  const { votes } = useProposalVotes(proposal.id)

  return (
    <Link className="OpenProposal" href={locations.proposal(proposal.id)}>
      <div className="OpenProposal__Section">
        <Username className="OpenProposal__Avatar" address={user} iconOnly size="medium" />
        <div>
          <h3 className="OpenProposal__Title">{title}</h3>
          <p className="OpenProposal__Details">
            <CategoryPill type={proposal.type} size="small" />
            <span className="OpenProposal__DetailsItem OpenProposal__UsernameContainer">
              {t('page.home.open_proposals.by_user')}
              <Username className="OpenProposal__Username" address={user} addressOnly />
            </span>
            <span className="OpenProposal__DetailsItem OpenProposal__DetailsOnlyDesktop">
              {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
            </span>
            <span className="OpenProposal__DetailsItem OpenProposal__DetailsOnlyDesktop">
              {t('page.home.open_proposals.comments', { total: comments?.totalComments })}
            </span>
            <span className="OpenProposal__DetailsItem">
              {t('page.home.open_proposals.date', { value: Time(finish_at).fromNow() })}
            </span>
          </p>
        </div>
      </div>
      <div className="OpenProposal__Section OpenProposal__VotingSection">
        <CategoryPill type={proposal.type} />
        {!hasVote && (
          <>
            <div className="OpenProposal__VotingContainer">
              <p className="OpenProposal__VotingConsensus">Consensus still not met</p>
              <p className="OpenProposal__VotingVpNeeded">250,000 VP needed</p>
            </div>
            <div className="OpenProposal__VoteContainer">
              <span className="OpenProposal__VoteText">Vote</span>
              <ChevronRight color="var(--black-400)" />
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

export default OpenProposal
