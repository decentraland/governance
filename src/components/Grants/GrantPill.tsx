import React from 'react'

import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
}

const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory, PillColor> = {
  [OldGrantCategory.Community]: PillColor.Green,
  [OldGrantCategory.ContentCreator]: PillColor.Orange,
  [OldGrantCategory.PlatformContributor]: PillColor.Purple,
  [OldGrantCategory.Gaming]: PillColor.Blue,

  // TODO: Review new colors
  [NewGrantCategory.Accelerator]: PillColor.Gray,
  [NewGrantCategory.CoreUnit]: PillColor.Gray,
  [NewGrantCategory.Documentation]: PillColor.Gray,
  [NewGrantCategory.InWorldContent]: PillColor.Gray,
  [NewGrantCategory.Platform]: PillColor.Gray,
  [NewGrantCategory.SocialMediaContent]: PillColor.Gray,
  [NewGrantCategory.Sponsorship]: PillColor.Gray,
}

function GrantPill({ type }: Props) {
  return (
    <Pill size="small" color={PROPOSAL_GRANT_CATEGORY_COLORS[type]}>
      {type.split(' ')[0]}
    </Pill>
  )
}

export default GrantPill
