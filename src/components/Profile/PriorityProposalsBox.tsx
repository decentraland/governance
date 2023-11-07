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
  const { votes, isLoadingVotes } = useProposalsCachedVotes(priorityProposals?.map((proposal) => proposal.id) || [])
  console.log('votes', votes) // TODO: remove after debugging
  const displayedProposals =
    votes && priorityProposals
      ? priorityProposals?.filter((proposal) => {
          return !(votes && address && votes[proposal.id] && !!votes[proposal.id][address])
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
