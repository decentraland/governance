import { NewProposalGovernance } from '../types';
import { formatMarkdown, template, formatLinkedProposal } from './utils';

export const title = (proposal: NewProposalGovernance) => proposal.title.split('\n')[0]

export const description = async (proposal: NewProposalGovernance) => template`

## Linked Draft Proposal
${ await formatLinkedProposal(proposal.linked_proposal_id)}

## Summary

${formatMarkdown(proposal.summary)}

## Abstract

${formatMarkdown(proposal.abstract)}

## Motivation

${formatMarkdown(proposal.motivation)}

## Specification

${formatMarkdown(proposal.specification)}

## Impacts

${formatMarkdown(proposal.impacts)}

## Implementation Pathways

${formatMarkdown(proposal.implementation_pathways)}

## Conclusion

${formatMarkdown(proposal.conclusion)}
`
