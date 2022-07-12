import React from 'react'

import { ProposalStatus, isProposalStatus } from '../../entities/Proposal/types'
import Pill, { PillColors } from '../Common/Pill'
import Check from '../Icon/Check'

import './StatusPill.css'

type Props = {
  status: ProposalStatus
}

const ColorsConfig: Record<ProposalStatus, PillColors> = {
  [ProposalStatus.Rejected]: 'red',
  [ProposalStatus.Pending]: 'gray',
  [ProposalStatus.Passed]: 'green',
  [ProposalStatus.Finished]: 'gray',
  [ProposalStatus.Active]: 'gray',
  [ProposalStatus.Enacted]: 'green',
  [ProposalStatus.Deleted]: 'red',
}

const StatusPill = ({ status }: Props) => {
  const label = isProposalStatus(status) ? status : ProposalStatus.Pending
  const showIcon = label === ProposalStatus.Enacted || label === ProposalStatus.Passed
  const iconColor = label === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'

  return (
    <Pill
      style={label === ProposalStatus.Enacted ? 'shiny' : 'medium'}
      className="StatusPill"
      color={ColorsConfig[label]}
      icon={showIcon ? <Check color={iconColor} /> : null}
    >
      {label}
    </Pill>
  )
}

export default StatusPill
