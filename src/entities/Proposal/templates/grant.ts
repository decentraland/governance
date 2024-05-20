import { GrantProposalConfiguration } from '../types'
import { formatBalance } from '../utils'

import { formatMarkdown, template } from './utils'

export const title = (proposal: GrantProposalConfiguration) => proposal.title.split('\n')[0]

const getDuration = (duration: number) => {
  const months = duration === 1 ? 'month' : 'months'

  return `
  
## Project duration
  
${duration} ${months}`
}

export const description = (proposal: GrantProposalConfiguration) => template`
Should the following $${formatBalance(proposal.size)} grant in the ${proposal.category} category be approved?

## Abstract

${formatMarkdown(proposal.abstract)}

## Grant size

${formatBalance(proposal.size)} USD${proposal.paymentToken ? ` in ${proposal.paymentToken}` : ''}
${proposal.projectDuration ? getDuration(proposal.projectDuration) : ''}

## Beneficiary address

${proposal.beneficiary}

## Email address

${proposal.email}

## Description

${formatMarkdown(proposal.description)}

## Milestones

${formatMarkdown(proposal.milestones.map((milestone) => `${milestone.delivery_date} - ${milestone.title}`).join('\n'))}
`
