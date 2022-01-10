import { NewProposalDraft } from '../types';
import { formatMarkdown, template, formatLinkedProposal } from './utils';

export const title = (proposal: NewProposalDraft) => proposal.title.split('\n')[0]

export const description = async (proposal: NewProposalDraft) => template`

## Linked Pre-Proposal
${await formatLinkedProposal(proposal.linked_proposal_id)}

## Summary

${formatMarkdown(proposal.summary)}

## Abstract

${formatMarkdown(proposal.abstract)}

## Motivation

${formatMarkdown(proposal.motivation)}

## Specification

${formatMarkdown(proposal.specification)}

## Conclusion

${formatMarkdown(proposal.conclusion)}
`
