import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { CoauthorAttributes, CoauthorStatus } from '../../entities/Coauthor/types'
import Cancel from '../Icon/Cancel'
import Check from '../Icon/Check'
import Warning from '../Icon/Warning'
import Username from '../User/Username'

interface Props {
  coauthor: CoauthorAttributes
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
        <span>
          <Username address={address} linked />
          {helperConfig[status].icon}
        </span>
      }
      on="hover"
    />
  )
}

export default ProposalDetailCoauthors
