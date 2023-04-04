import { NewProposalPitch } from '../types'

import { formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalPitch) => proposal.initiativeName.split('\n')[0]

export const description = (proposal: NewProposalPitch) => template`
## Problem Statement

${formatMarkdown(proposal.problemStatement)}

## Proposed Solution

${formatMarkdown(proposal.proposedSolution)}

## Target Audience/Customer Base

${proposal.targetAudience}

## Why is this relevant now?

${proposal.relevancy}
`
