import React, { Fragment } from 'react'

import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalStatus } from '../../entities/Proposal/types'
import { getProposalStatusDisplayName, getProposalStatusShortName } from '../../entities/Proposal/utils'
import locations from '../../modules/locations'
import Pill, { PillColor, Props as PillProps } from '../Common/Pill'
import Check from '../Icon/Check'

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
  const style = status === (ProposalStatus.Enacted || ProposalStatus.OutOfBudget) ? 'shiny' : 'outline'
  const classNames = TokenList.join(['StatusPill', className])
  const colorsConfig = ColorsConfig[status]
  const showIcon = status === ProposalStatus.Enacted || status === ProposalStatus.Passed
  const iconColor = status === ProposalStatus.Enacted ? 'var(--white-900)' : 'var(--green-800)'
  const icon = showIcon ? <Check color={iconColor} /> : null

  const Wrapper = isLink ? Link : 'div'
  const href = isLink ? locations.proposals({ status: status }) : undefined

  return (
    <>
      <Mobile>
        <Wrapper href={href}>
          <Pill size={'small'} style={style} className={classNames} color={colorsConfig} icon={icon}>
            {getProposalStatusShortName(status)}
          </Pill>
        </Wrapper>
      </Mobile>
      <NotMobile>
        <Wrapper href={href}>
          <Pill size={size || 'default'} style={style} className={classNames} color={colorsConfig} icon={icon}>
            {getProposalStatusDisplayName(status)}
          </Pill>
        </Wrapper>
      </NotMobile>
    </>
  )
}

export default StatusPill
