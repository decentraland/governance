export type BidProposalData = {
  [key: string]: string | BidProposalData
}

export type PendingBidsAttributes = {
  id: number
  created_at: string
  publish_at: string
  author_address: string
  tender_id: string
  bid_proposal_data: BidProposalData
}

export type NewPendingBid = {
  tender_id: string
  author_address: string
  bid_proposal_data: BidProposalData
  publish_at: string
}

export const newPendingBidScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['tender_id', 'author_address', 'bid_proposal_data', 'publish_at'],
  properties: {
    tender_id: {
      type: 'string',
      minLength: 1,
    },
    author_address: {
      type: 'string',
      minLength: 42,
      maxLength: 42,
    },
    bid_proposal_data: {
      type: 'object',
    },
    publish_at: {
      type: 'string',
    },
  },
}
