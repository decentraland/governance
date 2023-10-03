import React from 'react'

import classNames from 'classnames'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import { getProposalStatusDisplayName, getProposalStatusShortName } from '../../entities/Proposal/utils'
import locations from '../../utils/locations'
import Pill, { PillColor, Props as PillProps } from '../Common/Pill'
import Link from '../Common/Typography/Link'
import Check from '../Icon/Check'

type Props = {
  className?: string
  status: ProposalStatus
  size?: PillProps['size']
  isLink?: boolean
  color?: PillColor
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

export default function StatusPill({ className, status, size, isLink, color }: Props) {
  const isMobile = useMobileMediaQuery()

  const style = status === (ProposalStatus.Enacted || ProposalStatus.OutOfBudget) ? 'shiny' : 'outline'
  const showIcon = status === ProposalStatus.Enacted || status === ProposalStatus.Passed
  const iconColor = status === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'
  const icon = showIcon ? <Check color={iconColor} /> : null
  const href = isLink ? locations.proposals({ status: status }) : undefined
  const name = isMobile ? getProposalStatusShortName(status) : getProposalStatusDisplayName(status)
  const pillSize = isMobile ? 'sm' : size || 'md'

  const component = (
    <Pill
      size={pillSize}
      style={style}
      className={classNames('StatusPill', className)}
      color={color || ColorsConfig[status]}
      icon={icon}
    >
      {name}
    </Pill>
  )

  if (isLink) {
    return (
      <Link href={href} className="Pill__Link">
        {component}
      </Link>
    )
  }

  return component
}
