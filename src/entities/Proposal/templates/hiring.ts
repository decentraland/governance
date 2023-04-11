import { addressShortener } from '../../../helpers'
import { HiringType, NewProposalHiring } from '../types'

import { template } from './utils'

function getName(proposal: NewProposalHiring) {
  const hasName = !!proposal.name && proposal.name.length > 0
  return hasName ? proposal.name : addressShortener(proposal.address)
}

export const title = (proposal: NewProposalHiring) => {
  const name = getName(proposal)

  switch (proposal.type) {
    case HiringType.Add:
      return `Add ${name} to ${proposal.committee}`
    case HiringType.Remove:
      return `Remove ${name} from ${proposal.committee}`
    default:
      return ''
  }
}

export const description = (proposal: NewProposalHiring) => {
  const name = getName(proposal)
  const subtitle =
    proposal.type === HiringType.Add
      ? `Should ${name} be added to ${proposal.committee}?`
      : `Should ${name} be removed from ${proposal.committee}?`

  return template`
${subtitle}

## Address
${proposal.address}

## Reasons for ${proposal.type === HiringType.Add ? 'adding' : 'removing'}
${proposal.reasons}

## Evidence
${proposal.evidence}
`
}
