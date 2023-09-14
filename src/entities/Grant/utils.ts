import toSnakeCase from 'lodash/snakeCase'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET, ProjectStatus } from './types'

export const isValidGrantBudget = (size: number) => {
  return !(size < GRANT_PROPOSAL_MIN_BUDGET || size > GRANT_PROPOSAL_MAX_BUDGET)
}

export function toProjectStatus(status?: string | null): ProjectStatus | undefined {
  const statuses = Object.values(ProjectStatus)
  const index = statuses.map(toSnakeCase).indexOf(toSnakeCase(status || undefined))

  return index !== -1 ? statuses[index] : undefined
}
