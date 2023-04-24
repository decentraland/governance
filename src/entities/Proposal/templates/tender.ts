import { NewProposalTender } from '../types'

import { formatLinkedProposal, formatMarkdown, template } from './utils'

export const title = (proposal: NewProposalTender) => proposal.project_name.split('\n')[0]

export const description = async (proposal: NewProposalTender) => template`
Should funds from the DAO Treasury be allocated to finance a new community-led project addressing issues outlined herein?

## Linked Pitch Proposal
${await formatLinkedProposal(proposal.linked_proposal_id)}

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

## Target Release Quarter

${proposal.target_release_quarter}
`
