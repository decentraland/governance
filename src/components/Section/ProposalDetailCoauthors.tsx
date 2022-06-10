import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { CoauthorAttributes, CoauthorStatus } from '../../entities/Coauthor/types'
import Cancel from '../Icon/Cancel'
import Check from '../Icon/Check'
import QuestionCircle from '../Icon/QuestionCircle'
import Username from '../User/Username'

interface Props {
  coauthor: CoauthorAttributes
}

const icon: Record<CoauthorStatus, JSX.Element> = {
  [CoauthorStatus.PENDING]: <QuestionCircle size="10" />,
  [CoauthorStatus.APPROVED]: <Check size="10" />,
  [CoauthorStatus.REJECTED]: <Cancel size="10" />,
}

function ProposalDetailCoauthors({ coauthor }: Props) {
  const { coauthor_address, status } = coauthor
  const t = useFormatMessage()
  return (
    <Popup
      content={
        <span>
          {status === CoauthorStatus.PENDING
            ? t('page.proposal_detail.details_coauthor_pending_helper')
            : status === CoauthorStatus.APPROVED
            ? t('page.proposal_detail.details_coauthor_accepted_helper')
            : t('page.proposal_detail.details_coauthor_rejected_helper')}
        </span>
      }
      position="top center"
      trigger={
        <span>
          <Username address={coauthor_address} linked />
          {icon[status]}
        </span>
      }
      on="hover"
    />
  )
}

export default ProposalDetailCoauthors
