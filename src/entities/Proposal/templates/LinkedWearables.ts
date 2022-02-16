import { NewProposalLinkedWearables } from "../types";
import { formatMarkdown, template } from "./utils";

export const title = (proposal: NewProposalLinkedWearables) => template`Add ${proposal.name} to the Linked Wearables Registry`

export const description = (proposal: NewProposalLinkedWearables) => template`
Should ${proposal.name} be added to the Linked Wearables Registry?

## Introduction

${formatMarkdown(proposal.introduction)}

## NFT Collection(s) description

${formatMarkdown(proposal.nft_collections)}

## Governance

${formatMarkdown(proposal.governance)}

## Motivation

${formatMarkdown(proposal.motivation)}

## Smart Contract Address${proposal.smart_contract.length > 1 ? 'es': ''}

${proposal.smart_contract.map(addr => `- ${addr}\n`).join('')}

## Manager Address${proposal.managers.length > 1 ? 'es': ''}

${proposal.managers.map(addr => `- ${addr}\n`).join('')}

## Was at least one collection generated programmatically?
- **${proposal.programmatically_generated ? 'YES' : 'NO'}**

`
