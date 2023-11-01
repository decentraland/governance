import { useState } from 'react'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePriorityProposals from '../../hooks/usePriorityProposals'
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

  // TODO: internationalization
  return isLoading || (!isLoading && priorityProposals && priorityProposals.length === 0) ? null : (
    <>
      {collapsible ? (
        <ActionBox title={'Time Sensitive'} info={'Proposals that need your attention reit neu'} collapsible>
          {renderPriorityProposals(priorityProposals, displayedProposals)}
          {showViewMoreButton && (
            <FullWidthButton
              onClick={handleViewMore}
            >{`Show all ${priorityProposals?.length} proposals`}</FullWidthButton>
          )}
          {showViewLessButton && <FullWidthButton onClick={handleViewLess}>{`Show less`}</FullWidthButton>}
        </ActionBox>
      ) : (
        <>
          {renderPriorityProposals(priorityProposals, displayedProposals)}
          <FullWidthButton link={locations.proposals()}>
            {t('page.home.open_proposals.view_all_proposals')}
          </FullWidthButton>
        </>
      )}
    </>
  )
}

export default PriorityProposalsBox
