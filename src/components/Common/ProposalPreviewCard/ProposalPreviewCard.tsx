import { useState } from 'react'

import classNames from 'classnames'
import { Desktop, TabletAndBelow } from 'decentraland-ui/dist/components/Media/Media'

import { PriorityProposal, PriorityProposalType, ProposalAttributes } from '../../../entities/Proposal/types'
import { VoteByAddress } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposalComments from '../../../hooks/useProposalComments'
import { useProposalDateText } from '../../../hooks/useProposalDateText'
import useWinningChoice from '../../../hooks/useWinningChoice'
import Time from '../../../utils/date/Time'
import locations from '../../../utils/locations'
import CategoryPill from '../../Category/CategoryPill'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ChevronRight from '../../Icon/ChevronRight'
import Heading from '../Typography/Heading'

import CategoryModule from './CategoryModule'
import './ProposalPreviewCard.css'
import ProposalPreviewCardSection from './ProposalPreviewCardSection'
import VoteModule from './VoteModule'

enum Variant {
  Vote = 'vote',
  Category = 'category',
  Slim = 'slim',
}

interface Props {
  proposal: ProposalAttributes | PriorityProposal
  votes?: VoteByAddress
  variant: `${Variant}`
}

function getPriorityText(proposal: PriorityProposal, t: (...args: any[]) => any) {
  const isProposalActive = Time().isBefore(Time(proposal.finish_at))
  const dateText = getDateText(t, isProposalActive, proposal.finish_at)

  switch (proposal.priority_type) {
    case PriorityProposalType.ActiveGovernance:
      return dateText
    case PriorityProposalType.OpenPitch:
      return t('component.priority_proposals.open_pitch')
    case PriorityProposalType.PitchWithSubmissions:
      return t('component.priority_proposals.pitch_with_submissions')
    case PriorityProposalType.PitchOnVotingPhase:
      return t('component.priority_proposals.pitch_on_voting_phase')
    case PriorityProposalType.OpenTender:
      return dateText
    case PriorityProposalType.TenderWithSubmissions:
      return t('component.priority_proposals.tender_with_submissions')
    case PriorityProposalType.ActiveBid:
      return dateText
  }
}

function getDateText(t: (...args: any[]) => any, isProposalActive: boolean, finish_at: Date) {
  return t(`page.home.open_proposals.${isProposalActive ? 'ends_date' : 'ended_date'}`, {
    value: Time(finish_at).fromNow(),
  })
}

const ProposalPreviewCard = ({ proposal, votes, variant }: Props) => {
  const t = useFormatMessage()
  const { title, user, start_at, finish_at } = proposal
  const { comments } = useProposalComments(proposal.id, variant !== Variant.Slim)
  const { userChoice } = useWinningChoice(proposal, votes)
  const isProposalActive = Time().isBefore(Time(finish_at))
  const dateText = useProposalDateText(start_at, finish_at)
  const [isHovered, setIsHovered] = useState(false)

  const isProposalAboutToEnd = isProposalActive && Time(finish_at).diff(Time(), 'hours') < 24
  const showVotedChoice = variant === Variant.Category && !!userChoice
  const showCategoryModule = variant === Variant.Category || variant === Variant.Slim

  return (
    <Link
      className={classNames('ProposalPreviewCard', `ProposalPreviewCard--${variant}`)}
      href={locations.proposal(proposal.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ProposalPreviewCardSection>
        {variant !== Variant.Slim && (
          <Username className="ProposalPreviewCard__Avatar" address={user} variant="avatar" size="medium" />
        )}
        <div className="ProposalPreviewCard__TextContainer">
          <Heading as="h3" size="xs" weight="semi-bold" className="ProposalPreviewCard__Title">
            {title}
          </Heading>
          <span className="ProposalPreviewCard__Details">
            <TabletAndBelow>
              <CategoryPill className="ProposalPreviewCard__Pill" proposalType={proposal.type} size="sm" />
            </TabletAndBelow>
            {variant !== Variant.Slim && (
              <>
                {!showVotedChoice && (
                  <span className="ProposalPreviewCard__DetailsItem ProposalPreviewCard__UsernameContainer">
                    {t('page.home.open_proposals.by_user')}
                    <Username className="ProposalPreviewCard__Username" address={user} variant="address" />
                  </span>
                )}
                {showVotedChoice && (
                  <span
                    title={userChoice.toUpperCase()}
                    className={classNames(
                      'ProposalPreviewCard__DetailsItem',
                      'ProposalPreviewCard__DetailsItemVotedChoice'
                    )}
                  >
                    {t('page.proposal_detail.your_vote_label')}
                    <span className="ProposalPreviewCard__Vote">{userChoice}</span>
                  </span>
                )}
                <Desktop>
                  <span className="ProposalPreviewCard__DetailsItem">
                    {t('page.home.open_proposals.votes', { total: Object.keys(votes || {}).length })}
                  </span>
                  <span className="ProposalPreviewCard__DetailsItem">
                    {t('page.home.open_proposals.comments', { total: comments?.totalComments || 0 })}
                  </span>
                </Desktop>
              </>
            )}

            <span
              className={classNames(
                'ProposalPreviewCard__DetailsItem',
                isProposalAboutToEnd && variant !== Variant.Slim && 'ProposalPreviewCard__DetailsItem--highlight'
              )}
            >
              {variant !== Variant.Slim ? dateText : getPriorityText(proposal as PriorityProposal, t)}
            </span>
          </span>
        </div>
      </ProposalPreviewCardSection>
      {variant === Variant.Vote && <VoteModule proposal={proposal as ProposalAttributes} votes={votes} />}

      {showCategoryModule && (
        <CategoryModule proposal={proposal} isHovered={isHovered} slim={variant === Variant.Slim} />
      )}
      <TabletAndBelow>
        <div>
          <ChevronRight color="var(--black-400)" />
        </div>
      </TabletAndBelow>
    </Link>
  )
}

export default ProposalPreviewCard
