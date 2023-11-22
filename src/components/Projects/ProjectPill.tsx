import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import Pill, { PillColor, PillStyle, PillStyleType } from '../Common/Pill'

interface Props {
  type: ProposalGrantCategory
  style?: PillStyleType
}

const PROJECT_CATEGORY_COLORS: Record<ProposalGrantCategory | ProposalType.Tender, PillColor> = {
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

export default function ProjectPill({ type, style = PillStyle.Shiny }: Props) {
  const categoryType = getProjectCategory(type)

  return (
    <Pill size="sm" color={PROJECT_CATEGORY_COLORS[categoryType]} style={style}>
      {categoryType.split(' ')[0]}
    </Pill>
  )
}
