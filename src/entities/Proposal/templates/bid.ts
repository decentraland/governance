import { NewProposalTender } from '../types'

import { formatLinkedProposal, formatMarkdown, template } from './utils'

// TODO: Change type to NewProposalBid
export const title = (proposal: NewProposalTender) => proposal.project_name.split('\n')[0]

// TODO: Change type to NewProposalBid
export const description = async (proposal: NewProposalTender) => template`
// TODO: Update texts
Should funds from the DAO Treasury be allocated to finance a new community-led project addressing issues outlined herein?

## Linked Tender Proposal
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
