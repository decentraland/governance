import { ProposalGrantCategory, VALID_CATEGORIES } from '../Proposal/types'

import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from './constants'

export const isValidGrantBudget = (size: number) => {
  if (size < GRANT_PROPOSAL_MIN_BUDGET || size > GRANT_PROPOSAL_MAX_BUDGET) {
    return false
  }

  return true
}

export function isProposalGrantCategory(value: string | null | undefined): boolean {
  return VALID_CATEGORIES.includes(value as ProposalGrantCategory)
}
