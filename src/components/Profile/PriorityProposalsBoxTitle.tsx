import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { PriorityProposal } from '../../entities/Proposal/types'
import Counter from '../Common/Counter'

import './PriorityProposalsBoxTitle.css'

interface Props {
  isLoadingVotes: boolean
  displayedProposals?: PriorityProposal[]
  collapsedTitle: string
  counterColor?: 'primary' | 'gray'
}

export default function PriorityProposalsBoxTitle({
  isLoadingVotes,
  counterColor,
  displayedProposals,
  collapsedTitle,
}: Props) {
  return (
    <span className="PriorityProposalsBoxTitle">
      {isLoadingVotes && <Loader size="mini" active inline className="PriorityProposalsBoxTitle__Loader" />}
      {!isLoadingVotes && <Counter color={counterColor} count={displayedProposals?.length} />}
      {collapsedTitle}
    </span>
  )
}
