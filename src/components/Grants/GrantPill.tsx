import React from 'react'

import { ProposalGrantCategory } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
}

const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory, PillColor> = {
  [ProposalGrantCategory.Community]: PillColor.Green,
  [ProposalGrantCategory.ContentCreator]: PillColor.Orange,
  [ProposalGrantCategory.PlatformContributor]: PillColor.Purple,
  [ProposalGrantCategory.Gaming]: PillColor.Blue,

  // TODO: Review new colors
  [ProposalGrantCategory.Accelerator]: PillColor.Gray,
  [ProposalGrantCategory.CoreUnit]: PillColor.Gray,
  [ProposalGrantCategory.Documentation]: PillColor.Gray,
  [ProposalGrantCategory.InWorldContent]: PillColor.Gray,
  [ProposalGrantCategory.Platform]: PillColor.Gray,
  [ProposalGrantCategory.SocialMediaContent]: PillColor.Gray,
  [ProposalGrantCategory.Sponsorship]: PillColor.Gray,
}

function GrantPill({ type }: Props) {
  return (
    <Pill size="small" color={PROPOSAL_GRANT_CATEGORY_COLORS[type]}>
      {type.split(' ')[0]}
    </Pill>
  )
}

export default GrantPill
