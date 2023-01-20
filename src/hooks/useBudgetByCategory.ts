import { PROPOSAL_GRANT_CATEGORY_ALL } from '../entities/Proposal/types'

import { ProposalGrantCategory } from './../entities/Grant/types'

export default function useBudgetByCategory(category: ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL) {
  const [percentage, currentAmount, totalBudget, initiatives] = [45, '$44,444,444', '$3.5 million', 23]
  return { percentage, currentAmount, totalBudget, initiatives }
}
