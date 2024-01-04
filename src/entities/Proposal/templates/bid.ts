import { BidRequest } from '../../Bid/types'
import { formatBalance } from '../utils'

import { formatDate, formatLinkedProposal, formatMarkdown, template } from './utils'

export const title = (proposal: BidRequest & { bid_number: number }) =>
  `[BID-${String(proposal.bid_number).padStart(4, '0')}] ${proposal.teamName}`

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

## Delivery Date

${formatDate(new Date(proposal.deliveryDate))}

## Beneficiary address

${proposal.beneficiary}

## Email address

${proposal.email}

## Deliverables

${formatMarkdown(proposal.deliverables)}

## Roadmap and milestones

${formatMarkdown(proposal.roadmap)}
`
