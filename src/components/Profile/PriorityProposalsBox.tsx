import { useState } from 'react'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePriorityProposals from '../../hooks/usePriorityProposals'
import useProposalsCachedVotes from '../../hooks/useProposalsCachedVotes'
import locations from '../../utils/locations'
import { ActionBox } from '../Common/ActionBox'
import FullWidthButton from '../Common/FullWidthButton'
import ProposalPreviewCard from '../Common/ProposalPreviewCard/ProposalPreviewCard'

import './PriorityProposalsBox.css'

interface Props {
  address?: string | null
  collapsible?: boolean
}

const PROPOSALS_PER_PAGE = 5

function renderPriorityProposals(
  priorityProposals: any[] | Partial<ProposalAttributes>[] | undefined,
  displayedProposals: number
) {
  return (
    <>
      {priorityProposals &&
        priorityProposals.slice(0, displayedProposals).map((proposal) => {
          return <ProposalPreviewCard key={proposal.id} proposal={proposal as ProposalAttributes} variant="slim" />
        })}
    </>
  )
}

function PriorityProposalsBox({ address, collapsible = false }: Props) {
  const t = useFormatMessage()
  const { priorityProposals, isLoading } = usePriorityProposals(address)
  const proposalIds =
    priorityProposals?.reduce((acc: string[], priorityProposal) => {
      acc.push(priorityProposal.id)
      if (priorityProposal.linked_proposals_data && priorityProposal.linked_proposals_data.length > 0) {
        priorityProposal.linked_proposals_data.map((linkedProposal) => acc.push(linkedProposal.id))
      }
      return acc
    }, []) || []

  const { votes, isLoadingVotes } = useProposalsCachedVotes(proposalIds || [])
  const displayedProposals =
    votes && priorityProposals && address
      ? priorityProposals?.filter((proposal) => {
          const hasVotedOnMain = votes && address && votes[proposal.id] && !!votes[proposal.id][address]
          const hasVotedOnLinked = proposal.linked_proposals_data.some(
            (linkedProposal) => votes[linkedProposal.id] && !!votes[linkedProposal.id][address]
          )

          return !hasVotedOnMain && !hasVotedOnLinked
        })
      : priorityProposals
  const [displayedProposalsAmount, setDisplayedProposalsAmount] = useState(PROPOSALS_PER_PAGE)
  const hasMoreProposals = displayedProposals && displayedProposals.length > PROPOSALS_PER_PAGE
  const showViewMoreButton = hasMoreProposals && displayedProposalsAmount < displayedProposals.length
  const showViewLessButton = hasMoreProposals && displayedProposalsAmount >= displayedProposals.length

  const handleViewMore = () => {
    if (displayedProposals) setDisplayedProposalsAmount(displayedProposals.length)
  }

  const handleViewLess = () => {
    if (displayedProposals) setDisplayedProposalsAmount(PROPOSALS_PER_PAGE)
  }

  return isLoading || isLoadingVotes || (!isLoading && priorityProposals && priorityProposals.length === 0) ? null : (
    <>
      {collapsible ? (
        <ActionBox
          title={t('component.priority_proposals.title')}
          info={t('component.priority_proposals.info')}
          collapsible
        >
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount)}
          {showViewMoreButton && (
            <FullWidthButton onClick={handleViewMore}>
              {t('component.priority_proposals.show_all', { count: displayedProposals?.length })}
            </FullWidthButton>
          )}
          {showViewLessButton && <FullWidthButton onClick={handleViewLess}>{`Show less`}</FullWidthButton>}
        </ActionBox>
      ) : (
        <>
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount)}
          <FullWidthButton href={locations.proposals()}>
            {t('page.home.open_proposals.view_all_proposals')}
          </FullWidthButton>
        </>
      )}
    </>
  )
}

export default PriorityProposalsBox
