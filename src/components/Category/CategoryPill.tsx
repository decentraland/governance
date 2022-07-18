import React from 'react'

import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

import './CategoryPill.css'

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
  type: ProposalType
}

const CategoryPill = ({ type }: Props) => {
  const label = type.replaceAll('_', ' ')

  return (
    <Pill style="light" color={ColorsConfig[type]} className="CategoryPill">
      {label}
    </Pill>
  )
}

export default CategoryPill
