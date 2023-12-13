import { useState } from 'react'

import { useTabletAndBelowMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { PriorityProposal, PriorityProposalType } from '../../entities/Proposal/types'
import { getDisplayedPriorityProposals } from '../../entities/Proposal/utils'
import useFormatMessage, { FormatMessageFunction } from '../../hooks/useFormatMessage'
import usePriorityProposals from '../../hooks/usePriorityProposals'
import useProposalsCachedVotes from '../../hooks/useProposalsCachedVotes'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import { ActionBox } from '../Common/ActionBox'
import FullWidthButton from '../Common/FullWidthButton'
import ProposalPreviewCard from '../Common/ProposalPreviewCard/ProposalPreviewCard'
import ProposalItem from '../Proposal/ProposalItem'
import { BIDDING_AND_TENDERING_ANCHOR } from '../Proposal/View/BiddingAndTendering'

import './PriorityProposalsBox.css'
import PriorityProposalsBoxTitle from './PriorityProposalsBoxTitle'

interface Props {
  address?: string | null
  collapsible?: boolean
}

const PROPOSALS_PER_PAGE = 5

function getCardConfig(proposal: PriorityProposal, t: FormatMessageFunction) {
  switch (proposal.priority_type) {
    case PriorityProposalType.ActiveGovernance:
      return {
        customText: t('component.priority_proposals.active_governance', {
          time: Time(proposal.finish_at).fromNow(),
        }),
      }
    case PriorityProposalType.OpenPitch:
      return {
        customText: t('component.priority_proposals.open_pitch'),
      }
    case PriorityProposalType.PitchWithSubmissions:
      return {
        customText: t('component.priority_proposals.pitch_with_submissions', {
          time: Time(proposal.linked_proposals_data![0].start_at).fromNow(),
        }),
        anchor: BIDDING_AND_TENDERING_ANCHOR,
      }
    case PriorityProposalType.PitchOnTenderVotingPhase:
      return {
        customText: t('component.priority_proposals.pitch_on_tender_voting_phase', {
          time: Time(proposal.linked_proposals_data![0].finish_at).fromNow(),
        }),
        anchor: BIDDING_AND_TENDERING_ANCHOR,
      }
    case PriorityProposalType.OpenTender:
      return {
        customText: t('component.priority_proposals.open_tender'),
      }
    case PriorityProposalType.TenderWithSubmissions:
      return {
        customText: t('component.priority_proposals.tender_with_submissions', {
          time: Time(proposal.unpublished_bids_data![0].publish_at).fromNow(),
        }),
        anchor: BIDDING_AND_TENDERING_ANCHOR,
      }
    case PriorityProposalType.ActiveBid:
      return {
        customText: t('component.priority_proposals.active_bids', { time: Time(proposal.finish_at).fromNow() }),
      }
  }
}

function renderPriorityProposals(
  priorityProposals: PriorityProposal[] | undefined,
  displayedProposals: number,
  isTabletAndBelow: boolean,
  t: FormatMessageFunction
) {
  return (
    <>
      {priorityProposals &&
        priorityProposals.slice(0, displayedProposals).map((proposal) => {
          const { customText, anchor } = getCardConfig(proposal, t)
          return isTabletAndBelow ? (
            <ProposalItem key={proposal.id} proposal={proposal} slim customText={customText} anchor={anchor} />
          ) : (
            <ProposalPreviewCard
              key={proposal.id}
              proposal={proposal}
              variant="slim"
              customText={customText}
              anchor={anchor}
            />
          )
        })}
    </>
  )
}

function getProposalsAndLinkedProposalsIds(priorityProposals?: PriorityProposal[]) {
  return (
    priorityProposals?.reduce((acc: string[], priorityProposal) => {
      acc.push(priorityProposal.id)
      if (priorityProposal.linked_proposals_data && priorityProposal.linked_proposals_data.length > 0) {
        priorityProposal.linked_proposals_data.map((linkedProposal) => acc.push(linkedProposal.id))
      }
      return acc
    }, []) || []
  )
}

function PriorityProposalsBox({ address, collapsible = false }: Props) {
  const t = useFormatMessage()
  const isTabletAndBelow = useTabletAndBelowMediaQuery()
  const lowerAddress = address?.toLowerCase()
  const { priorityProposals, isLoading } = usePriorityProposals(lowerAddress)
  const proposalIds = getProposalsAndLinkedProposalsIds(priorityProposals)
  const { votes, isLoadingVotes } = useProposalsCachedVotes(proposalIds)
  const displayedProposals = getDisplayedPriorityProposals(votes, priorityProposals, lowerAddress)
  const [displayedProposalsAmount, setDisplayedProposalsAmount] = useState(PROPOSALS_PER_PAGE)
  const hasMoreProposals = displayedProposals && displayedProposals.length > PROPOSALS_PER_PAGE
  const showViewMoreButton = hasMoreProposals && displayedProposalsAmount < displayedProposals.length
  const showViewLessButton = hasMoreProposals && displayedProposalsAmount >= displayedProposals.length
  const hidePriorityProposalsBox =
    isLoading ||
    (!isLoading && priorityProposals && priorityProposals.length === 0) ||
    (!isLoading && displayedProposals && displayedProposals.length === 0)

  const handleViewMore = () => {
    if (displayedProposals) setDisplayedProposalsAmount(displayedProposals.length)
  }

  const handleViewLess = () => {
    if (displayedProposals) setDisplayedProposalsAmount(PROPOSALS_PER_PAGE)
  }

  return hidePriorityProposalsBox ? null : (
    <div className="ProposalsPage__Priority">
      {collapsible ? (
        <ActionBox
          id={'priority-proposals-box'}
          title={
            <PriorityProposalsBoxTitle
              isLoadingVotes={isLoadingVotes}
              displayedProposals={displayedProposals}
              collapsedTitle={t('component.priority_proposals.title')}
              counterColor={'gray'}
            />
          }
          info={t('component.priority_proposals.info')}
          collapsible
          collapsedTitle={
            <PriorityProposalsBoxTitle
              isLoadingVotes={isLoadingVotes}
              displayedProposals={displayedProposals}
              collapsedTitle={t('component.priority_proposals.title')}
            />
          }
        >
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount, isTabletAndBelow, t)}
          {showViewMoreButton && (
            <FullWidthButton onClick={handleViewMore}>
              {t('component.priority_proposals.show_all', { count: displayedProposals?.length })}
            </FullWidthButton>
          )}
          {showViewLessButton && (
            <FullWidthButton onClick={handleViewLess}>{t('component.priority_proposals.show_less')}</FullWidthButton>
          )}
        </ActionBox>
      ) : (
        <>
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount, isTabletAndBelow, t)}
          <FullWidthButton href={locations.proposals()}>
            {t('page.home.open_proposals.view_all_proposals')}
          </FullWidthButton>
        </>
      )}
    </div>
  )
}

export default PriorityProposalsBox
