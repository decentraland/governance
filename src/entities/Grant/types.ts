export const GRANT_PROPOSAL_MIN_BUDGET = 100
export const GRANT_PROPOSAL_MAX_BUDGET = 240000
export const MIN_PROJECT_DURATION = 1
export const MAX_PROJECT_DURATION = 12
export const MIN_LOW_TIER_PROJECT_DURATION = MIN_PROJECT_DURATION
export const MAX_LOW_TIER_PROJECT_DURATION = 6
export const MIN_HIGH_TIER_PROJECT_DURATION = 3
export const MAX_HIGH_TIER_PROJECT_DURATION = MAX_PROJECT_DURATION

export type GrantTierAttributes = {
  type: GrantTierType
  min: number
  max: number
  status: GrantTierStatus
}

export enum GrantTierStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum GrantTierType {
  Tier1 = 'Tier 1: up to $1,500 USD in MANA, one-time payment',
  Tier2 = 'Tier 2: up to $3,000 USD in MANA, one-time payment',
  Tier3 = 'Tier 3: up to $5,000 USD in MANA, 3 months vesting (1 month cliff)',
  Tier4 = 'Tier 4: up to $60,000 USD, 6 months vesting (1 month cliff)',
  Tier5 = 'Tier 5: up to $120,000 USD, 6 months vesting (1 month cliff)',
  Tier6 = 'Tier 6: up to $240,000 USD, 6 months vesting (1 month cliff)',
  LowerTier = 'Lower Tier',
  HigherTier = 'Higher Tier',
}

export enum OldGrantCategory {
  Community = 'Community',
  ContentCreator = 'Content Creator',
  Gaming = 'Gaming',
  PlatformContributor = 'Platform Contributor',
}

export enum NewGrantCategory {
  Accelerator = 'Accelerator',
  CoreUnit = 'Core Unit',
  Documentation = 'Documentation',
  InWorldContent = 'In-World Content',
  Platform = 'Platform',
  SocialMediaContent = 'Social Media Content',
  Sponsorship = 'Sponsorship',
}

export type ProposalGrantCategory = OldGrantCategory | NewGrantCategory

export const VALID_CATEGORIES = Object.values(NewGrantCategory)

export enum GrantStatus {
  InProgress = 'In Progress',
  Finished = 'Finished',
  Paused = 'Paused',
  Revoked = 'Revoked',
}

export const GrantRequestGeneralInfoSchema = {
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
  description: { type: 'string', minLength: 20, maxLength: 3500 },
  specification: {
    type: 'string',
    minLength: 20,
    maxLength: 3500,
  },
  beneficiary: {
    type: 'string',
    format: 'address',
  },
  email: {
    type: 'string',
    format: 'email',
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

export const GrantRequestFundingSchema = {
  funding: {
    type: 'integer',
    minimum: Number(GRANT_PROPOSAL_MIN_BUDGET || 0),
    maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
  },
  projectDuration: {
    type: 'integer',
    minimum: Number(MIN_PROJECT_DURATION || 1),
    maximum: Number(MAX_PROJECT_DURATION || 1),
  },
}

export const GrantRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'category',
    'funding',
    'projectDuration',
    'title',
    'abstract',
    'description',
    'specification',
    'beneficiary',
    'email',
    'personnel',
    'roadmap',
  ],
  properties: {
    category: {
      type: 'string',
      enum: VALID_CATEGORIES,
    },
    ...GrantRequestFundingSchema,
    ...GrantRequestGeneralInfoSchema,
  },
}
