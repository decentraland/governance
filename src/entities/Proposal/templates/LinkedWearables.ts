import { NewProposalLinkedWearables } from "../types";
import { formatMarkdown, template } from "./utils";

const getList = (items: string[]) => items.map(it => `- ${it}\n`).join('')

export const title = (proposal: NewProposalLinkedWearables) => template`Add ${proposal.name} to the Linked Wearables Registry`

export const description = (proposal: NewProposalLinkedWearables) => template`
Should ${proposal.name} be added to the Linked Wearables Registry?

## Relevant links

${getList(proposal.links)}

## NFT Collection(s) description

${formatMarkdown(proposal.nft_collections)}

## Governance

${formatMarkdown(proposal.governance)}

## Motivation

${formatMarkdown(proposal.motivation)}

## Smart Contract Address${proposal.smart_contract.length > 1 ? 'es': ''}

${getList(proposal.smart_contract)}

## Manager Address${proposal.managers.length > 1 ? 'es': ''}

${getList(proposal.managers)}

## Is this collection generated programmatically?
- **${proposal.programmatically_generated ? 'Yes' : 'No'}**

${proposal.method.length > 0 ? `
## Method

${formatMarkdown(proposal.method)}
` : ''}
`
