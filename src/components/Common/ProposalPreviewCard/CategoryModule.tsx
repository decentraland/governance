import { ProposalAttributes } from '../../../entities/Proposal/types'
import CategoryPill from '../../Category/CategoryPill'
import ChevronRight from '../../Icon/ChevronRight'
import StatusPill from '../../Status/StatusPill'

import './CategoryModule.css'
import ProposalPreviewCardSection from './ProposalPreviewCardSection'

interface Props {
  proposal: ProposalAttributes
  isHovered?: boolean
}

function CategoryModule({ proposal, isHovered }: Props) {
  return (
    <ProposalPreviewCardSection className="CategoryModule">
      <div className="CategoryModule__PillContainer">
        <StatusPill status={proposal.status} />
        <CategoryPill proposalType={proposal.type} />
      </div>
      {isHovered && <ChevronRight color="var(--black-400)" />}
    </ProposalPreviewCardSection>
  )
}

export default CategoryModule
