import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

const ColorsConfig: Record<ProposalType, PillColor> = {
  [ProposalType.POI]: PillColor.Green,
  [ProposalType.Catalyst]: PillColor.Blue,
  [ProposalType.BanName]: PillColor.Fuchsia,
  [ProposalType.Grant]: PillColor.Purple,
  [ProposalType.LinkedWearables]: PillColor.Yellow,
  [ProposalType.Poll]: PillColor.Orange,
  [ProposalType.Draft]: PillColor.Orange,
  [ProposalType.Governance]: PillColor.Orange,
}

export type Props = {
  className?: string
  type: ProposalType
  size?: 'small' | 'default'
}

const CategoryPill = ({ className, type, size = 'default' }: Props) => {
  const label = type.replaceAll('_', ' ')

  return (
    <Pill style="light" color={ColorsConfig[type]} className={TokenList.join(['CategoryPill', className])} size={size}>
      {label}
    </Pill>
  )
}

export default CategoryPill
