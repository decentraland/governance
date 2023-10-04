import classNames from 'classnames'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
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
  const t = useFormatMessage()
  return (
    <ProposalPreviewCardSection className="CategoryModule">
      <div className="CategoryModule__Container">
        <div className="CategoryModule__StatusPill">
          <StatusPill status={proposal.status} />
        </div>
        <CategoryPill proposalType={proposal.type} />
        {proposal.type === ProposalType.Grant && (
          <span className="CategoryModule__GrantSize">{`$${t('general.number', {
            value: proposal.configuration.size,
          })}`}</span>
        )}
      </div>
      <ChevronRight
        className={classNames('CategoryModule__Chevron', isHovered && 'CategoryModule__Chevron--visible')}
        color="var(--black-400)"
      />
    </ProposalPreviewCardSection>
  )
}

export default CategoryModule
