import { useState } from 'react'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePriorityProposals from '../../hooks/usePriorityProposals'
import useProposalsCachedVotes from '../../hooks/useProposalsCachedVotes'
import locations from '../../utils/locations'
import FullWidthButton from '../Common/FullWidthButton'
import ProposalPreviewCard from '../Common/ProposalPreviewCard/ProposalPreviewCard'

import { ActionBox } from './ActionBox'
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
  console.log('priorityProposals', priorityProposals)
  const proposalIds =
    priorityProposals?.reduce((acc: string[], priorityProposal) => {
      acc.push(priorityProposal.id)
      if (priorityProposal.linked_proposals_ids && priorityProposal.linked_proposals_ids.length > 0) {
        acc.push(...priorityProposal.linked_proposals_ids)
      }
      return acc
    }, []) || []

  const { votes, isLoadingVotes } = useProposalsCachedVotes(proposalIds || [])
  console.log('votes', votes)
  const displayedProposals =
    votes && priorityProposals && address
      ? priorityProposals?.filter((proposal) => {
          const hasVotedOnMain = votes && address && votes[proposal.id] && !!votes[proposal.id][address]
          const hasVotedOnLinked = proposal.linked_proposals_ids.some(
            (linkedId) => votes[linkedId] && !!votes[linkedId][address]
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

  // TODO: internationalization
  return isLoading || isLoadingVotes || (!isLoading && priorityProposals && priorityProposals.length === 0) ? null : (
    <>
      {collapsible ? (
        <ActionBox title={'Time Sensitive'} info={'Proposals that need your attention reit neu'} collapsible>
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount)}
          {showViewMoreButton && (
            <FullWidthButton
              onClick={handleViewMore}
            >{`Show all ${displayedProposals?.length} proposals`}</FullWidthButton>
          )}
          {showViewLessButton && <FullWidthButton onClick={handleViewLess}>{`Show less`}</FullWidthButton>}
        </ActionBox>
      ) : (
        <>
          {renderPriorityProposals(displayedProposals, displayedProposalsAmount)}
          <FullWidthButton link={locations.proposals()}>
            {t('page.home.open_proposals.view_all_proposals')}
          </FullWidthButton>
        </>
      )}
    </>
  )
}

export default PriorityProposalsBox
