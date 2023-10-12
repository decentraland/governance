import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColor } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
}

const PROJECT_CATEGORY_COLORS: Record<ProposalGrantCategory | 'tender', PillColor> = {
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

function getProjectCategory(category: ProposalGrantCategory | 'bid'): ProposalGrantCategory | 'tender' {
  if (category === ProposalType.Bid) {
    return ProposalType.Tender
  }

  return category
}

export default function ProjectPill({ type }: Props) {
  const categoryType = getProjectCategory(type)

  return (
    <Pill size="sm" color={PROJECT_CATEGORY_COLORS[categoryType]}>
      {categoryType.split(' ')[0]}
    </Pill>
  )
}
