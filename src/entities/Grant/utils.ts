import toSnakeCase from 'lodash/snakeCase'

import Accelerator from '../../components/Icon/Grants/Accelerator'
import CoreUnit from '../../components/Icon/Grants/CoreUnit'
import Documentation from '../../components/Icon/Grants/Documentation'
import InWorldContent from '../../components/Icon/Grants/InWorldContent'
import Platform from '../../components/Icon/Grants/Platform'
import SocialMediaContent from '../../components/Icon/Grants/SocialMediaContent'
import Sponsorship from '../../components/Icon/Grants/Sponsorship'

import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MIN_BUDGET,
  GrantStatus,
  NewGrantCategory,
  OldGrantCategory,
  ProposalGrantCategory,
} from './types'

export const isValidGrantBudget = (size: number) => {
  return !(size < GRANT_PROPOSAL_MIN_BUDGET || size > GRANT_PROPOSAL_MAX_BUDGET)
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

export function toProposalGrantCategory(category?: string | null): ProposalGrantCategory | null {
  const categories = [...Object.values(NewGrantCategory), ...Object.values(OldGrantCategory)]
  const idx = categories.map(toSnakeCase).indexOf(toSnakeCase(category || undefined))

  return idx !== -1 ? categories[idx] : null
}

export function toGrantStatus(status?: string | null): GrantStatus | null {
  const statuses = Object.values(GrantStatus)
  const idx = statuses.map(toSnakeCase).indexOf(toSnakeCase(status || undefined))

  return idx !== -1 ? statuses[idx] : null
}

export function isCurrentGrant(newGrantStatus?: GrantStatus) {
  return (
    newGrantStatus === GrantStatus.InProgress ||
    newGrantStatus === GrantStatus.Paused ||
    newGrantStatus === GrantStatus.Pending
  )
}
