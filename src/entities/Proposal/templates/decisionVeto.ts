import { SNAPSHOT_SPACE_COUNCIL } from '../../Snapshot/constants'
import { NewProposalCouncilDecisionVeto } from '../types'
import { snapshotProposalUrl } from '../utils'

import { formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalCouncilDecisionVeto) => `Veto "${proposal.title.split('\n')[0].trim()}"`

export const description = (proposal: NewProposalCouncilDecisionVeto) => {
  return template`
Should we veto the Council Decision "${proposal.title.split('\n')[0].trim()}"?

## Decision URL
${snapshotProposalUrl({
  snapshot_id: proposal.decision_snapshot_id,
  snapshot_space: SNAPSHOT_SPACE_COUNCIL,
})}

## Reasons to Veto
${formatMarkdown(proposal.reasons)}

## Suggestions to the Council
${formatMarkdown(proposal.suggestions)}
`
}
