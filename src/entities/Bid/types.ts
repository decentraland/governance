import { BudgetBreakdownConcept, GrantRequestDueDiligenceSchema, GrantRequestTeamSchema } from '../Grant/types'

export enum BidStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

type BidProposalData = Omit<BidRequest, 'linked_proposal_id'>

export type BidAttributes = UnpublishedBid & {
  created_at: string
}

export type UnpublishedBid = {
  linked_proposal_id: string
  author_address: string
  bid_proposal_data: BidProposalData
  publish_at: string
  status: BidStatus
}

export type BidRequestFunding = {
  funding: number
  projectDuration: number
  startDate: string
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

export type BidRequestDueDiligence = {
  budgetBreakdown: BudgetBreakdownConcept[]
}

export type BidRequest = BidRequestFunding &
  BidRequestGeneralInfo &
  BidRequestTeam &
  BidRequestDueDiligence & {
    linked_proposal_id: string
    coAuthors?: string[]
  }

export const BidRequestFundingSchema = {
  funding: {
    type: 'integer',
    minimum: 100,
    maximum: 240000,
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

export const BidRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'linked_proposal_id',
    ...Object.keys(BidRequestFundingSchema),
    ...Object.keys(BidRequestGeneralInfoSchema).filter((section) => section !== 'coAuthors'),
    ...Object.keys(GrantRequestTeamSchema),
    ...Object.keys(GrantRequestDueDiligenceSchema),
  ],
  properties: {
    linked_proposal_id: {
      type: 'string',
      minLength: 36,
      maxLength: 255,
    },
    ...BidRequestFundingSchema,
    ...BidRequestGeneralInfoSchema,
    ...GrantRequestTeamSchema,
    ...GrantRequestDueDiligenceSchema,
  },
}
