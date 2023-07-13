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

export type BidRequestFunding = {
  funding: string | number
  projectDuration: number
  startDate: string | null
  beneficiary: string
  email: string
}

export type BidRequestGeneralInfo = {
  deliverables: string
  roadmap: string
  coAuthors?: string[]
}

export type TeamMember = {
  name: string
  role: string
  about: string
  relevantLink?: string
}

export type BidRequestTeam = {
  members: TeamMember[]
}

export type BidRequest = BidRequestFunding & BidRequestGeneralInfo & BidRequestTeam

export const BidRequestFundingSchema = {
  funding: {
    type: 'integer',
    minimum: 0,
    maximum: 0,
  },
  projectDuration: {
    type: 'integer',
    minimum: 1,
    maximum: 12,
  },
  startDate: {
    type: 'string',
  },
  beneficiary: {
    type: 'string',
    format: 'address',
  },
  email: {
    type: 'string',
    format: 'email',
  },
}

export const BidRequestGeneralInfoSchema = {
  deliverables: {
    type: 'string',
    minLength: 20,
    maxLength: 1500,
  },
  roadmap: {
    type: 'string',
    minLength: 20,
    maxLength: 1500,
  },
  coAuthors: {
    type: 'array',
    items: {
      type: 'string',
      minLength: 42,
      maxLength: 42,
    },
  },
}
