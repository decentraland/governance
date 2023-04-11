import { NewProposalTender } from '../types'

import { formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalTender) => proposal.project_name.split('\n')[0]

export const description = (proposal: NewProposalTender) => template`
Should the problem/opportunity outlined be refined and taken to the next level?

## Summary

${formatMarkdown(proposal.summary)}

## Problem Statement

${formatMarkdown(proposal.problem_statement)}

## Technical Specification

${formatMarkdown(proposal.technical_specification)}

## Use Cases

${formatMarkdown(proposal.use_cases)}

## Deliverables

${formatMarkdown(proposal.deliverables)}

## Target Release Date

${proposal.target_release_date}
`
