import Accelerator from '../../components/Icon/Grants/Accelerator'
import CoreUnit from '../../components/Icon/Grants/CoreUnit'
import Documentation from '../../components/Icon/Grants/Documentation'
import InWorldContent from '../../components/Icon/Grants/InWorldContent'
import Platform from '../../components/Icon/Grants/Platform'
import SocialMediaContent from '../../components/Icon/Grants/SocialMediaContent'
import Sponsorship from '../../components/Icon/Grants/Sponsorship'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from './constants'
import { NewGrantCategory, OldGrantCategory, ProposalGrantCategory } from './types'

export const isValidGrantBudget = (size: number) => {
  if (size < GRANT_PROPOSAL_MIN_BUDGET || size > GRANT_PROPOSAL_MAX_BUDGET) {
    return false
  }

  return true
}

export function isProposalGrantCategory(value: string | null | undefined): boolean {
  return [...Object.values(NewGrantCategory), ...Object.values(OldGrantCategory)].includes(
    value as ProposalGrantCategory
  )
}

export function getNewGrantsCategoryIcon(category: NewGrantCategory) {
  switch (category) {
    case NewGrantCategory.Accelerator:
      return Accelerator
    case NewGrantCategory.CoreUnit:
      return CoreUnit
    case NewGrantCategory.Documentation:
      return Documentation
    case NewGrantCategory.InWorldContent:
      return InWorldContent
    case NewGrantCategory.Platform:
      return Platform
    case NewGrantCategory.SocialMediaContent:
      return SocialMediaContent
    case NewGrantCategory.Sponsorship:
    default:
      return Sponsorship
  }
}
