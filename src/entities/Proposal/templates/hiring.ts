import { addressShortener } from '../../../helpers'
import { HiringType, NewProposalHiring } from '../types'

import { template } from './utils'

type HiringConfig = NewProposalHiring & { name: string }

function getName(proposal: HiringConfig) {
  const hasName = proposal.name && proposal.name.length > 0
  return hasName ? proposal.name : addressShortener(proposal.address)
}

export const title = (proposal: HiringConfig) => {
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

export const description = (proposal: HiringConfig) => {
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
