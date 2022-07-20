import React from 'react'

import { ProposalStatus, isProposalStatus } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'
import Check from '../Icon/Check'

import './StatusPill.css'

type Props = {
  status: ProposalStatus
}

const ColorsConfig: Record<ProposalStatus, PillColor> = {
  [ProposalStatus.Rejected]: PillColor.Red,
  [ProposalStatus.Pending]: PillColor.Gray,
  [ProposalStatus.Passed]: PillColor.Green,
  [ProposalStatus.Finished]: PillColor.Gray,
  [ProposalStatus.Active]: PillColor.Gray,
  [ProposalStatus.Enacted]: PillColor.Green,
  [ProposalStatus.Deleted]: PillColor.Red,
}

const StatusPill = ({ status }: Props) => {
  const label = isProposalStatus(status) ? status : ProposalStatus.Pending
  const showIcon = label === ProposalStatus.Enacted || label === ProposalStatus.Passed
  const iconColor = label === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'

  return (
    <Pill
      style={label === ProposalStatus.Enacted ? 'shiny' : 'outline'}
      className="StatusPill"
      color={ColorsConfig[label]}
      icon={showIcon ? <Check color={iconColor} /> : null}
    >
      {label}
    </Pill>
  )
}

export default StatusPill
