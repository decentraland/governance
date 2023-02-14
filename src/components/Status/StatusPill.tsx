import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalStatus } from '../../entities/Proposal/types'
import { isProposalStatus } from '../../entities/Proposal/utils'
import Pill, { PillColor, Props as PillProps } from '../Common/Pill'
import Check from '../Icon/Check'

type Props = {
  className?: string
  status: ProposalStatus
  size?: PillProps['size']
}

const ColorsConfig: Record<ProposalStatus, PillColor> = {
  [ProposalStatus.Pending]: PillColor.Gray,
  [ProposalStatus.Active]: PillColor.Gray,
  [ProposalStatus.Finished]: PillColor.Gray,
  [ProposalStatus.Passed]: PillColor.Green,
  [ProposalStatus.Enacted]: PillColor.Green,
  [ProposalStatus.OutOfBudget]: PillColor.Yellow,
  [ProposalStatus.Rejected]: PillColor.Red,
  [ProposalStatus.Deleted]: PillColor.Red,
}

const StatusPill = ({ className, status, size }: Props) => {
  const label = isProposalStatus(status) ? status : ProposalStatus.Pending
  const showIcon = label === ProposalStatus.Enacted || label === ProposalStatus.Passed
  const iconColor = label === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'

  return (
    <Pill
      size={size || 'default'}
      style={label === (ProposalStatus.Enacted || ProposalStatus.OutOfBudget) ? 'shiny' : 'outline'}
      className={TokenList.join(['StatusPill', className])}
      color={ColorsConfig[label]}
      icon={showIcon ? <Check color={iconColor} /> : null}
    >
      {label}
    </Pill>
  )
}

export default StatusPill
