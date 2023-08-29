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
  NewGrantCategory,
  OldGrantCategory,
  ProjectStatus,
  ProposalGrantCategory,
} from './types'

export const isValidGrantBudget = (size: number) => {
  return !(size < GRANT_PROPOSAL_MIN_BUDGET || size > GRANT_PROPOSAL_MAX_BUDGET)
}

export function toProposalGrantCategory(category?: string | null): ProposalGrantCategory | null {
  const categories = [...Object.values(NewGrantCategory), ...Object.values(OldGrantCategory)]
  const index = categories.map(toSnakeCase).indexOf(toSnakeCase(category || undefined))

  return index !== -1 ? categories[index] : null
}

export function toProjectStatus(status?: string | null): ProjectStatus | undefined {
  const statuses = Object.values(ProjectStatus)
  const index = statuses.map(toSnakeCase).indexOf(toSnakeCase(status || undefined))

  return index !== -1 ? statuses[index] : undefined
}
