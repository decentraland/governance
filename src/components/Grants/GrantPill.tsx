import React from 'react'

import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../entities/Grant/types'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
}

const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory, PillColor> = {
  [OldGrantCategory.Community]: PillColor.Green,
  [OldGrantCategory.ContentCreator]: PillColor.Orange,
  [OldGrantCategory.PlatformContributor]: PillColor.Purple,
  [OldGrantCategory.Gaming]: PillColor.Blue,

  [NewGrantCategory.Accelerator]: PillColor.Green,
  [NewGrantCategory.CoreUnit]: PillColor.Blue,
  [NewGrantCategory.Documentation]: PillColor.Purple,
  [NewGrantCategory.InWorldContent]: PillColor.Red,
  [NewGrantCategory.Platform]: PillColor.Fuchsia,
  [NewGrantCategory.SocialMediaContent]: PillColor.Yellow,
  [NewGrantCategory.Sponsorship]: PillColor.Orange,
}

function GrantPill({ type }: Props) {
  return (
    <Pill size="sm" color={PROPOSAL_GRANT_CATEGORY_COLORS[type]}>
      {type.split(' ')[0]}
    </Pill>
  )
}

export default GrantPill
