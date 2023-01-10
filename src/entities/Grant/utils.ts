import { ProposalGrantCategory } from '../Proposal/types'

export function isProposalGrantCategory(value: string | null | undefined): boolean {
  switch (value) {
    case ProposalGrantCategory.Community:
    case ProposalGrantCategory.ContentCreator:
    case ProposalGrantCategory.PlatformContributor:
    case ProposalGrantCategory.Gaming:
      return true
    default:
      return false
  }
}
