import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'
import { isEmpty } from 'lodash'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { calculateResult } from '../../entities/Votes/utils'
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
  const { comments } = useProposalComments(proposal.id)
  const { votes } = useProposalVotes(proposal.id)
  const [account] = useAuthContext()
  const hasVote = account && !isEmpty(votes?.[account])
  const results = useMemo(
    () => calculateResult(proposal?.snapshot_proposal?.choices || [], votes || {}),
    [proposal?.snapshot_proposal?.choices, votes]
  )
  const vpInFavor = results[0].power || 0
  const threshold = proposal?.required_to_pass || 0
  const neededForAcceptance = threshold - vpInFavor
  const isThresholdStillNotMet = neededForAcceptance >= 0

  const votingConsensusText = t(
    `page.home.open_proposals.${isThresholdStillNotMet ? 'threshold_not_met' : 'threshold_met'}`
  )
  const votingNeededText = t(`page.home.open_proposals.${isThresholdStillNotMet ? 'vp_needed' : 'vp'}`, {
    value: t('general.number', { value: isThresholdStillNotMet ? neededForAcceptance : vpInFavor }),
  })
  const dateText = t(`page.home.open_proposals.${Time().isBefore(Time(finish_at)) ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })

  return (
    <Link className="OpenProposal" href={locations.proposal(proposal.id)}>
      <div className="OpenProposal__Section">
        <Username className="OpenProposal__Avatar" address={user} iconOnly size="medium" />
        <div>
          <h3 className="OpenProposal__Title">{title}</h3>
          <span className="OpenProposal__Details">
            <Mobile>
              <CategoryPill type={proposal.type} size="small" />
            </Mobile>
            <span className="OpenProposal__DetailsItem OpenProposal__UsernameContainer">
              {t('page.home.open_proposals.by_user')}
              <Username className="OpenProposal__Username" address={user} addressOnly />
            </span>
            <span className="OpenProposal__DetailsItem OpenProposal__DetailsOnlyDesktop">
              {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
            </span>
            <span className="OpenProposal__DetailsItem OpenProposal__DetailsOnlyDesktop">
              {t('page.home.open_proposals.comments', { total: comments?.totalComments || 0 })}
            </span>
            <span className="OpenProposal__DetailsItem">{dateText}</span>
          </span>
        </div>
      </div>
      <div className="OpenProposal__Section OpenProposal__VotingSection">
        <CategoryPill type={proposal.type} />
        {!hasVote && (
          <>
            <div className="OpenProposal__VotingContainer">
              <p className="OpenProposal__VotingConsensus">{votingConsensusText}</p>
              <p className="OpenProposal__VotingVpNeeded">{votingNeededText}</p>
            </div>
            <div className="OpenProposal__VoteContainer">
              <span className="OpenProposal__VoteText">Vote</span>
              <ChevronRight color="var(--black-400)" />
            </div>
          </>
        )}
      </div>
      <Mobile>
        <ChevronRight color="var(--black-400)" />
      </Mobile>
    </Link>
  )
}

export default OpenProposal
