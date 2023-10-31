import { useState } from 'react'

import { ProposalAttributes } from '../../entities/Proposal/types'
import usePriorityProposals from '../../hooks/usePriorityProposals'
import FullWidthButton from '../Common/FullWidthButton'
import SlimProposalCard from '../Proposal/SlimProposalCard'

import { ActionBox } from './ActionBox'
import './PriorityProposalsBox.css'

interface Props {
  title: string
  info?: string
  address: string
  collapsible?: boolean
}

const PROPOSALS_PER_PAGE = 5

//TODO: extract common behavior with voted proposals box
function PriorityProposalsBox({ title, info, address, collapsible }: Props) {
  const { priorityProposals, isLoading } = usePriorityProposals(address)
  const [displayedProposals, setDisplayedProposals] = useState(PROPOSALS_PER_PAGE)
  const hasMoreProposals = priorityProposals && priorityProposals.length > PROPOSALS_PER_PAGE
  const showViewMoreButton = hasMoreProposals && displayedProposals < priorityProposals.length
  const showViewLessButton = hasMoreProposals && displayedProposals >= priorityProposals.length

  const handleViewMore = () => {
    if (priorityProposals) setDisplayedProposals(priorityProposals.length)
  }

  const handleViewLess = () => {
    if (priorityProposals) setDisplayedProposals(PROPOSALS_PER_PAGE)
  }

  return isLoading || (!isLoading && priorityProposals && priorityProposals.length === 0) ? null : (
    <ActionBox title={title} info={info} collapsible={collapsible}>
      {priorityProposals &&
        priorityProposals.slice(0, displayedProposals).map((proposal) => {
          return <SlimProposalCard key={proposal.id} proposal={proposal as ProposalAttributes} />
        })}
      {showViewMoreButton && (
        <FullWidthButton onClick={handleViewMore}>{`Show all ${priorityProposals?.length} proposals`}</FullWidthButton>
      )}
      {showViewLessButton && <FullWidthButton onClick={handleViewLess}>{`Show less`}</FullWidthButton>}
    </ActionBox>
  )
}

export default PriorityProposalsBox
