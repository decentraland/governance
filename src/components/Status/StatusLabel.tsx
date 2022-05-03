import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalStatus, isProposalStatus } from '../../entities/Proposal/types'

import './StatusLabel.css'

const check = require('../../images/icons/check.svg').default
const checkInvert = require('../../images/icons/check-invert.svg').default

export type StatusLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  status: ProposalStatus
}

export default React.memo(function StatusLabel({ status, ...props }: StatusLabelProps) {
  status = isProposalStatus(status) ? status : ProposalStatus.Pending
  return (
    <div {...props} className={TokenList.join(['StatusLabel', `StatusLabel--${status}`, props.className])}>
      {status === ProposalStatus.Passed && <img src={check} width="20" height="20" />}
      {status === ProposalStatus.Enacted && <img src={checkInvert} width="20" height="20" />}
      <span>{status}</span>
    </div>
  )
})
