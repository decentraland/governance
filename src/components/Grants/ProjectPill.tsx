import React from 'react'

import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
}

const PROPOSAL_GRANT_CATEGORY_COLORS: Record<ProposalGrantCategory | ProposalType.Tender, PillColor> = {
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

  [ProposalType.Tender]: PillColor.Red,
}

function getProjectCategory(
  category: ProposalGrantCategory | ProposalType.Bid
): ProposalGrantCategory | ProposalType.Tender {
  if (category === ProposalType.Bid) {
    return ProposalType.Tender
  }

  return category
}

export default function GrantPill({ type }: Props) {
  return (
    <Pill size="sm" color={PROPOSAL_GRANT_CATEGORY_COLORS[type]}>
      {getProjectCategory(type).split(' ')[0]}
    </Pill>
  )
}
