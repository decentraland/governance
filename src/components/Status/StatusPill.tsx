import React from 'react'

import classNames from 'classnames'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import { getProposalStatusDisplayName, getProposalStatusShortName } from '../../entities/Proposal/utils'
import locations from '../../utils/locations'
import Pill, { PillColor, Props as PillProps } from '../Common/Pill'
import Link from '../Common/Typography/Link'
import Check from '../Icon/Check'

import './StatusPill.css'

type Props = {
  className?: string
  status: ProposalStatus
  size?: PillProps['size']
  isLink?: boolean
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

const StatusPill = ({ className, status, size, isLink }: Props) => {
  const isMobile = useMobileMediaQuery()

  const style = status === (ProposalStatus.Enacted || ProposalStatus.OutOfBudget) ? 'shiny' : 'outline'
  const showIcon = status === ProposalStatus.Enacted || status === ProposalStatus.Passed
  const iconColor = status === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'
  const icon = showIcon ? <Check color={iconColor} /> : null
  const Wrapper = isLink ? Link : 'div'
  const href = isLink ? locations.proposals({ status: status }) : undefined
  const name = isMobile ? getProposalStatusShortName(status) : getProposalStatusDisplayName(status)
  const pillSize = isMobile ? 'small' : size || 'default'

  return (
    <Wrapper href={href} className="StatusPill">
      <Pill
        size={pillSize}
        style={style}
        className={classNames('StatusPill', className)}
        color={ColorsConfig[status]}
        icon={icon}
      >
        {name}
      </Pill>
    </Wrapper>
  )
}

export default StatusPill
