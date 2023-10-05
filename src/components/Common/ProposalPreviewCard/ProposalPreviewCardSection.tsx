import classNames from 'classnames'

import './ProposalPreviewCardSection.css'

interface Props {
  className?: string
  children?: React.ReactNode
}

function ProposalPreviewCardSection({ className, children }: Props) {
  return <div className={classNames('ProposalPreviewCard__Section', className)}>{children}</div>
}

export default ProposalPreviewCardSection
