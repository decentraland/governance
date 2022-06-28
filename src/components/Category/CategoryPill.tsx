import React from 'react'

import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColors } from '../Common/Pill'

import './CategoryPill.css'

const ColorsConfig: Record<ProposalType, PillColors> = {
  [ProposalType.POI]: 'green',
  [ProposalType.Catalyst]: 'blue',
  [ProposalType.BanName]: 'fuchsia',
  [ProposalType.Grant]: 'purple',
  [ProposalType.LinkedWearables]: 'yellow',
  [ProposalType.Poll]: 'orange',
  [ProposalType.Draft]: 'orange',
  [ProposalType.Governance]: 'orange',
}

export type Props = {
  type: ProposalType
}

const CategoryPill = ({ type }: Props) => {
  const label = type.replaceAll('_', ' ')

  return (
    <Pill style="medium" color={ColorsConfig[type]} className="CategoryPill">
      {label}
    </Pill>
  )
}

export default CategoryPill
