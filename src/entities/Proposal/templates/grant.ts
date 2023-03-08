import { GrantProposalConfiguration } from '../types'
import { formatBalance } from '../utils'

import { formatMarkdown, template } from './utils'

export const title = (proposal: GrantProposalConfiguration) => proposal.title.split('\n')[0]

export const description = (proposal: GrantProposalConfiguration) => template`
Should the following $${formatBalance(proposal.size)} grant in the ${proposal.category} category be approved?

## Abstract

${formatMarkdown(proposal.abstract)}

## Grant size

${formatBalance(proposal.size)} USD

## Beneficiary address

${proposal.beneficiary}

## Email address

${proposal.email}

## Description

${formatMarkdown(proposal.description)}

## Roadmap and milestones

${formatMarkdown(proposal.roadmap)}
`
