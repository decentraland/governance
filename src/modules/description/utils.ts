import { ProposalDescription } from './types'

export function getProposalInitialAddress(description?: ProposalDescription) {
  if (!description?.firstDescribedSteps?.length) {
    return undefined
  }

  return description.firstDescribedSteps[0].to
}
