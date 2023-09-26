import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Desktop, TabletAndBelow } from 'decentraland-ui/dist/components/Media/Media'
import isEmpty from 'lodash/isEmpty'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProposalComments from '../../hooks/useProposalComments'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import Link from '../Common/Typography/Link'
import Username from '../Common/Username'
import ChevronRight from '../Icon/ChevronRight'

import './OpenProposal.css'

interface Props {
  proposal: ProposalAttributes
  votes?: Record<string, Vote>
}

const OpenProposal = ({ proposal, votes }: Props) => {
  const t = useFormatMessage()
  const { title, user, finish_at } = proposal
  const { comments } = useProposalComments(proposal.id)
  const [account] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const hasVote = !!account && !isEmpty(votes?.[account])
  const vote = hasVote && !!votes?.[account].choice ? choices[votes?.[account].choice - 1] : undefined
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
        <Username className="OpenProposal__Avatar" address={user} variant="avatar" size="medium" />
        <div className="OpenProposal__TextContainer">
          <h3 className="OpenProposal__Title">{title}</h3>
          <span className="OpenProposal__Details">
            <TabletAndBelow>
              <CategoryPill className="OpenProposal__Pill" proposalType={proposal.type} size="sm" />
            </TabletAndBelow>
            <span className="OpenProposal__DetailsItem OpenProposal__UsernameContainer">
              {t('page.home.open_proposals.by_user')}
              <Username className="OpenProposal__Username" address={user} variant="address" />
            </span>
            <Desktop>
              <span className="OpenProposal__DetailsItem">
                {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
              </span>
              <span className="OpenProposal__DetailsItem">
                {t('page.home.open_proposals.comments', { total: comments?.totalComments || 0 })}
              </span>
            </Desktop>
            <span className="OpenProposal__DetailsItem">{dateText}</span>
          </span>
        </div>
      </div>
      <div className="OpenProposal__Section OpenProposal__VotingSection">
        <div className="OpenProposal__PillContainer">
          <CategoryPill proposalType={proposal.type} />
        </div>
        <div className="OpenProposal__VoteSection">
          <div className={`OpenProposal__VotingContainer${hasVote ? '--Voted' : ''}`}>
            {hasVote ? (
              <>
                <p className="OpenProposal__VotingConsensus">{t('page.home.open_proposals.you_voted')}</p>
                <p className="OpenProposal__VotingVpNeeded">{vote || '-'}</p>
              </>
            ) : (
              <>
                <p className="OpenProposal__VotingConsensus">{votingConsensusText}</p>
                <p className="OpenProposal__VotingVpNeeded">{votingNeededText}</p>
              </>
            )}
          </div>
          <div className="OpenProposal__VoteContainer">
            {!hasVote && <span className="OpenProposal__VoteText">{t('page.home.open_proposals.vote')}</span>}
            <ChevronRight color="var(--black-400)" />
          </div>
        </div>
      </div>
      <TabletAndBelow>
        <div>
          <ChevronRight color="var(--black-400)" />
        </div>
      </TabletAndBelow>
    </Link>
  )
}

export default OpenProposal
