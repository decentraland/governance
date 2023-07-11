export type BidProposalData = {
  [key: string]: string | BidProposalData
}

export enum BidStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export type BidAttributes = {
  created_at: string
  publish_at: string
  author_address: string
  tender_id: string
  bid_proposal_data: BidProposalData
}

export type NewBid = {
  linked_proposal_id: string
  author_address: string
  bid_proposal_data: BidProposalData
  publish_at: string
  status: BidStatus
}

export const newBidScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['linked_proposal_id', 'bid_proposal_data'],
  properties: {
    linked_proposal_id: {
      type: 'string',
      minLength: 36,
      maxLength: 255,
    },
    bid_proposal_data: {
      type: 'object',
    },
  },
}
