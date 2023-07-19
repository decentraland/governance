import { formatDate } from '../../../utils/date/Time'
import { BidRequest } from '../../Bid/types'
import { formatBalance } from '../utils'

import { formatLinkedProposal, formatMarkdown, template } from './utils'

// TODO: Change
export const title = (proposal: BidRequest) => `Bid #${Math.round(Math.random() * 100)}`

const getDuration = (duration: number) => {
  const months = duration === 1 ? 'month' : 'months'

  return `
  
## Project duration
  
${duration} ${months}`
}

export const description = async (proposal: BidRequest) => template`
Should funds from the DAO Treasury be allocated to finance a new community-led project addressing issues outlined herein?

## Linked Tender Proposal
${await formatLinkedProposal(proposal.linked_proposal_id)}

## Budget

${formatBalance(Number(proposal.funding))} USD
${getDuration(proposal.projectDuration)}

## Start Date

${formatDate(new Date(proposal.startDate || ''))}

## Beneficiary address

${proposal.beneficiary}

## Email address

${proposal.email}

## Deliverables

${formatMarkdown(proposal.deliverables)}

## Roadmap and milestones

${formatMarkdown(proposal.roadmap)}
`
