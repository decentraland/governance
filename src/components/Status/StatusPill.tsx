import classNames from 'classnames'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import { getProposalStatusShortName } from '../../entities/Proposal/utils'
import { getEnumDisplayName } from '../../helpers'
import locations from '../../utils/locations'
import Pill, { PillColor, Props as PillProps } from '../Common/Pill'
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
  const name = isMobile ? getProposalStatusShortName(status) : getEnumDisplayName(status)
  const pillSize = isMobile ? 'sm' : size || 'md'

  return (
    <Pill
      size={pillSize}
      style={style}
      className={classNames('StatusPill', className)}
      color={color || ColorsConfig[status]}
      icon={icon}
      href={href}
    >
      {name}
    </Pill>
  )
}
