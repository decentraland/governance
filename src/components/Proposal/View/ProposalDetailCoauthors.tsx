import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { CoauthorAttributes, CoauthorStatus } from '../../../entities/Coauthor/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Username from '../../Common/Username'
import Cancel from '../../Icon/Cancel'
import Check from '../../Icon/Check'
import Warning from '../../Icon/Warning'

import './ProposalDetailCoauthors.css'

interface Props {
  coauthor: CoauthorAttributes
  className?: string
}

interface CoauthorHelperConfiguration {
  helperKey: string
  icon: JSX.Element
}

const helperConfig: Record<CoauthorStatus, CoauthorHelperConfiguration> = {
  [CoauthorStatus.PENDING]: {
    helperKey: 'page.proposal_detail.details_coauthor_pending_helper',
    icon: <Warning size="10" />,
  },
  [CoauthorStatus.APPROVED]: {
    helperKey: 'page.proposal_detail.details_coauthor_accepted_helper',
    icon: <Check size="10" />,
  },
  [CoauthorStatus.REJECTED]: {
    helperKey: 'page.proposal_detail.details_coauthor_rejected_helper',
    icon: <Cancel size="10" />,
  },
}

function ProposalDetailCoauthors({ coauthor }: Props) {
  const { address, status } = coauthor
  const t = useFormatMessage()

  return (
    <Popup
      content={<span>{t(helperConfig[status].helperKey)}</span>}
      position="top center"
      trigger={
        <span className="ProposalDetailCoauthors">
          <Username address={address} linked />
          {helperConfig[status].icon}
        </span>
      }
      on="hover"
    />
  )
}

export default ProposalDetailCoauthors
