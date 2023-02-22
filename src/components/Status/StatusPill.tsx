import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import {
  getProposalStatusDisplayName,
  getProposalStatusShortName,
  isProposalStatus,
} from '../../entities/Proposal/utils'
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
  const validStatus = isProposalStatus(status) ? status : ProposalStatus.Pending
  const style = validStatus === (ProposalStatus.Enacted || ProposalStatus.OutOfBudget) ? 'shiny' : 'outline'
  const classNames = TokenList.join(['StatusPill', className])
  const colorsConfig = ColorsConfig[validStatus]
  const showIcon = validStatus === ProposalStatus.Enacted || validStatus === ProposalStatus.Passed
  const iconColor = validStatus === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'
  const icon = showIcon ? <Check color={iconColor} /> : null

  return (
    <>
      <Mobile>
        <Pill size={'small'} style={style} className={classNames} color={colorsConfig} icon={icon}>
          {getProposalStatusShortName(validStatus)}
        </Pill>
      </Mobile>
      <NotMobile>
        <Pill size={size || 'default'} style={style} className={classNames} color={colorsConfig} icon={icon}>
          {getProposalStatusDisplayName(validStatus)}
        </Pill>
      </NotMobile>
    </>
  )
}

export default StatusPill
