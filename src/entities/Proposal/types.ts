import { MAX_NAME_SIZE, MIN_NAME_SIZE, REGEX_NAME } from "./utils"

export type ProposalAttributes = {
  id: string
  snapshot_id: string
  snapshot_space: string
  snapshot_proposal: any
  snapshot_signature: string
  snapshot_network: string
  discourse_id: number
  discourse_topic_id: number
  discourse_topic_slug: string
  user: string
  title: string
  description: string,
  type: ProposalType
  status: ProposalStatus
  configuration: any
  start_at: Date
  finish_at: Date
  deleted: boolean
  deleted_by: string | null,
  enacted: boolean
  enacted_description: string | null
  enacted_by: string | null
  created_at: Date
  updated_at: Date
}

export enum ProposalStatus {
  Pending = 'pending',
  Active = 'active',
  Finished = 'finished',
  Rejected = 'rejected',
  Passed = 'passed',
  Enacted = 'enacted',
}

export function isProposalStatus(value:  string | null | undefined): boolean {
  switch (value) {
    case ProposalStatus.Pending:
    case ProposalStatus.Finished:
    case ProposalStatus.Active:
    case ProposalStatus.Rejected:
    case ProposalStatus.Passed:
    case ProposalStatus.Enacted:
      return true
    default:
      return false
  }
}

export function toProposalStatus(value: string | null | undefined): ProposalStatus | null {
  return isProposalStatus(value)?
    value as ProposalStatus :
    null
}

export enum ProposalType {
  POI = 'poi',
  Catalyst = 'catalyst',
  BanName = 'ban_name',
  Grant = 'grant',
  Poll = 'poll',
}

export function isProposalType(value:  string | null | undefined): boolean {
  switch (value) {
    case ProposalType.POI:
    case ProposalType.Catalyst:
    case ProposalType.BanName:
    case ProposalType.Grant:
    case ProposalType.Poll:
      return true
    default:
      return false
  }
}

export function toProposalType(value: string | null | undefined): ProposalType | null {
  return isProposalType(value)?
    value as ProposalType :
    null
}

export type EnactProposalProposal = {
  enacted_description: string
}

export const enactProposalScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'enacted_description',
  ],
  properties: {
    enacted_description: {
      type: ['string', 'null']
    }
  }
}

export type NewProposalPoll = {
  title: string,
  description: string,
  options: string[],
}

export const newProposalPollScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'description',
    'options',
  ],
  properties: {
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 200,
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    options: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
      minItems: 2
    }
  }
}

export type NewProposalBanName = {
  name: string,
  description: string,
}

export const newProposalBanNameScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description'],
  properties: {
    name: {
      type: 'string',
      minLength: MIN_NAME_SIZE,
      maxLength: MAX_NAME_SIZE,
      pattern: REGEX_NAME,
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    }
  }
}

export type NewProposalPOI = {
  x: number,
  y: number,
  description: string,
}

export const newProposalPOIScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y', 'description'],
  properties: {
    x: {
      type: 'integer',
      minimum: -150,
      maximum: 150
    },
    y: {
      type: 'integer',
      minimum: -150,
      maximum: 150,
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    }
  }
}

export type NewProposalCatalyst = {
  owner: string,
  domain: string,
  description: string
}

export const newProposalCatalystScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['owner', 'domain', 'description'],
  properties: {
    owner: {
      type: 'string',
      format: 'address'
    },
    domain: {
      type: 'string',
      format: 'domain'
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    }
  }
}

export enum ProposalGrantCategory {
  Community = 'Community',
  ContentCreator = 'Content Creator',
  PlatformContributor = 'Platform Contributor',
  Gaming = 'Gaming',
  Exceptional = 'Exceptional',
}

export function isProposalGrantCategory(value:  string | null | undefined): boolean {
  switch (value) {
    case ProposalGrantCategory.Community:
    case ProposalGrantCategory.ContentCreator:
    case ProposalGrantCategory.PlatformContributor:
    case ProposalGrantCategory.Gaming:
    case ProposalGrantCategory.Exceptional:
      return true
    default:
      return false
  }
}

export enum ProposalGrantTier {
  Tier1 = 'Tier 1: $250-$500 USD',
  Tier2 = 'Tier 2: $500-$1000 USD',
  Tier3 = 'Tier 3: $1000-$2000 USD',
  // Tier4 = 'Tier 4: $2000-$3000 USD',
  // Tier5 = 'Tier 5: $3000-$5000 USD',
  // TierX = 'Tier X: $5000+ USD',
}

export function isProposalGrantTier(value:  string | null | undefined): boolean {
  switch (value) {
    case ProposalGrantTier.Tier1:
    case ProposalGrantTier.Tier2:
    case ProposalGrantTier.Tier3:
    // case ProposalGrantTier.Tier4:
    // case ProposalGrantTier.Tier5:
    // case ProposalGrantTier.TierX:
      return true
    default:
      return false
  }
}

export type NewProposalGrant = {
  title: string,
  abstract: string,
  category: ProposalGrantCategory,
  tier: ProposalGrantTier,
  size: number,
  description: string,
  specification: string,
  personnel: string,
  roadmap: string
}

export const newProposalGrantScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'abstract',
    'category',
    'tier',
    'description',
    'specification',
    'personnel',
    'roadmap'
  ],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    abstract: {
      type: 'string',
      minLength: 1,
      maxLength: 750,
    },
    category: {
      type: 'string',
      enum: [
        ProposalGrantCategory.Community,
        ProposalGrantCategory.ContentCreator,
        ProposalGrantCategory.PlatformContributor,
        ProposalGrantCategory.Gaming,
        ProposalGrantCategory.Exceptional,
      ]
    },
    tier: {
      type: 'string',
      enum: [
        ProposalGrantTier.Tier1,
        ProposalGrantTier.Tier2,
        ProposalGrantTier.Tier3,
        // ProposalGrantTier.Tier4,
        // ProposalGrantTier.Tier5,
        // ProposalGrantTier.TierX,
      ]
    },
    size: {
      type: 'integer',
      min: 0
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    specification: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    personnel: {
      type: 'string',
      minLength: 20,
      maxLength: 1500,
    },
    roadmap: {
      type: 'string',
      minLength: 20,
      maxLength: 1500,
    }
  }
}