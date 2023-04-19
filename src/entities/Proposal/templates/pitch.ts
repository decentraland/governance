import { NewProposalPitch } from '../types'

import { formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalPitch) => proposal.initiative_name.split('\n')[0]

export const description = (proposal: NewProposalPitch) => template`
Should the problem/opportunity outlined be refined and taken to the next level?

## Problem Statement

${formatMarkdown(proposal.problem_statement)}

## Proposed Solution

${formatMarkdown(proposal.proposed_solution)}

## Target Audience/Customer Base

${formatMarkdown(proposal.target_audience)}

## Why is this relevant now?

${formatMarkdown(proposal.relevance)}
`
