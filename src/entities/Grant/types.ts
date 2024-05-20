import camelCase from 'lodash/camelCase'
import cloneDeep from 'lodash/cloneDeep'

import { toNewGrantCategory } from '../QuarterCategoryBudget/utils'

export const GRANT_PROPOSAL_MIN_BUDGET = 100
export const GRANT_PROPOSAL_MAX_BUDGET = 240000
export const MIN_PROJECT_DURATION = 1
export const MAX_PROJECT_DURATION = 12
export const MIN_LOW_TIER_PROJECT_DURATION = MIN_PROJECT_DURATION
export const MAX_LOW_TIER_PROJECT_DURATION = 6
export const MIN_HIGH_TIER_PROJECT_DURATION = 3
export const MAX_HIGH_TIER_PROJECT_DURATION = MAX_PROJECT_DURATION

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

export enum SubtypeAlternativeOptions {
  All = 'all_grants',
  Legacy = 'legacy',
}

export type SubtypeOptions = `${NewGrantCategory}` | `${SubtypeAlternativeOptions}`

export enum VestingStartDate {
  First = '1st',
  Fifteenth = '15th',
}

export enum PaymentToken {
  MANA = 'MANA',
  DAI = 'DAI',
}

export type ProposalGrantCategory = OldGrantCategory | NewGrantCategory

export const VALID_CATEGORIES = [NewGrantCategory.CoreUnit, NewGrantCategory.Platform]

export enum TransparencyProjectStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Finished = 'Finished',
  Paused = 'Paused',
  Revoked = 'Revoked',
}

export enum ProjectStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Finished = 'finished',
  Paused = 'paused',
  Revoked = 'revoked',
}

export function isGrantSubtype(value: string | null | undefined) {
  return (
    !!value &&
    (value === SubtypeAlternativeOptions.Legacy || new Set<string>(Object.values(NewGrantCategory)).has(value))
  )
}

export function toGrantSubtype<OrElse>(value: string | null | undefined, orElse: () => OrElse) {
  return isGrantSubtype(value) ? (value as SubtypeOptions) : orElse()
}

const MilestoneItemSchema = {
  title: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
  description: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  delivery_date: {
    type: 'string',
    minLength: 1,
    maxLength: 10,
  },
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
    maxLength: 500,
  },
  description: { type: 'string', minLength: 20, maxLength: 3250 },
  beneficiary: {
    type: 'string',
    format: 'address',
  },
  email: {
    type: 'string',
    format: 'email',
  },
  milestones: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: [...Object.keys(MilestoneItemSchema)],
      properties: MilestoneItemSchema,
    },
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
  vestingStartDate: {
    type: 'string',
    enum: Object.values(VestingStartDate),
  },
  paymentToken: {
    type: 'string',
    enum: Object.values(PaymentToken),
  },
}

export const AcceleratorQuestionsSchema = {
  revenueGenerationModel: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  returnOfInvestmentPlan: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  investmentRecoveryTime: {
    type: 'integer',
    minimum: 0,
  },
}

export const DocumentationQuestionsSchema = {
  contentType: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalPieces: {
    type: 'integer',
    minimum: 1,
  },
}

export const InWorldContentQuestionsSchema = {
  totalPieces: {
    type: 'integer',
    minimum: 0,
  },
  totalUsers: {
    type: 'integer',
    minimum: 0,
  },
  engagementMeasurement: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

export const SocialMediaContentQuestionsSchema = {
  socialMediaPlatforms: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  audienceRelevance: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalPieces: {
    type: 'integer',
    minimum: 0,
  },
  totalPeopleImpact: {
    type: 'integer',
    minimum: 0,
  },
  relevantLink: {
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
}

export const SponsorshipQuestionsSchema = {
  eventType: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  eventCategory: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  primarySourceFunding: {
    type: 'string',
    minLength: 1,
    maxLength: 10,
  },
  audienceRelevance: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  totalAttendance: {
    type: 'integer',
    minimum: 1,
  },
  totalEvents: {
    type: 'integer',
    minimum: 1,
  },
  showcase: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

export const CoreUnitQuestionsSchema = {
  strategicValue: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  impactMetrics: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}
export const PlatformQuestionsSchema = {
  impactMetrics: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
}

export const BudgetBreakdownConceptSchema = {
  concept: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
  duration: {
    type: 'integer',
    minimum: Number(MIN_PROJECT_DURATION || 1),
    maximum: Number(MAX_PROJECT_DURATION || 1),
  },
  estimatedBudget: {
    type: 'integer',
    minimum: 1,
    maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
  },
  aboutThis: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  relevantLink: {
    type: 'string',
    minLength: 0,
    maxLength: 200,
  },
}

export const TeamMemberItemSchema = {
  name: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
  role: {
    type: 'string',
    minLength: 1,
    maxLength: 80,
  },
  about: {
    type: 'string',
    minLength: 1,
    maxLength: 750,
  },
  address: {
    type: 'string',
    format: 'address',
  },
  relevantLink: {
    type: 'string',
    minLength: 0,
    maxLength: 200,
  },
}

export const GrantRequestTeamSchema = {
  members: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: [...Object.keys(TeamMemberItemSchema)],
      properties: TeamMemberItemSchema,
    },
  },
}

export const GrantRequestDueDiligenceSchema = {
  budgetBreakdown: {
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: false,
      required: [...Object.keys(BudgetBreakdownConceptSchema)],
      properties: BudgetBreakdownConceptSchema,
    },
  },
}

export const GrantRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'category',
    ...Object.keys(GrantRequestFundingSchema),
    ...Object.keys(GrantRequestGeneralInfoSchema).filter((section) => section !== 'coAuthors'),
    ...Object.keys(GrantRequestDueDiligenceSchema),
    ...Object.keys(GrantRequestTeamSchema),
  ],
  properties: {
    category: {
      type: 'string',
      enum: VALID_CATEGORIES,
    },
    ...GrantRequestFundingSchema,
    ...GrantRequestGeneralInfoSchema,
    ...GrantRequestDueDiligenceSchema,
    ...GrantRequestTeamSchema,
  },
}

export type GrantRequest = {
  category: NewGrantCategory | null
} & GrantRequestFunding &
  GrantRequestGeneralInfo &
  GrantRequestTeam &
  GrantRequestCategoryAssessment &
  GrantRequestDueDiligence

export type GrantRequestFunding = {
  funding: string | number
  projectDuration: number
  vestingStartDate: VestingStartDate
  paymentToken: PaymentToken
}

export type GrantRequestGeneralInfo = {
  title: string
  abstract: string
  description: string
  beneficiary: string
  email: string
  specification?: string
  personnel?: string
  milestones: Milestone[]
  coAuthors?: string[]
}

export type BudgetBreakdownConcept = {
  concept: string
  duration: number
  estimatedBudget: string | number
  aboutThis: string
  relevantLink?: string
}

export type GrantRequestDueDiligence = {
  budgetBreakdown: BudgetBreakdownConcept[]
}

export type TeamMember = {
  name: string
  role: string
  about: string
  address?: string
  relevantLink?: string
}

type Milestone = {
  title: string
  description: string
  delivery_date: string
}

export type GrantRequestTeam = {
  members: TeamMember[]
}

export type GrantRequestCategoryAssessment = {
  accelerator?: AcceleratorQuestions
  coreUnit?: CoreUnitQuestions
  documentation?: DocumentationQuestions
  inWorldContent?: InWorldContentQuestions
  socialMediaContent?: SocialMediaContentQuestions
  sponsorship?: SponsorshipQuestions
  platform?: PlatformQuestions
}

export type AcceleratorQuestions = {
  revenueGenerationModel: string
  returnOfInvestmentPlan: string
  investmentRecoveryTime: string | number
}

export type DocumentationQuestions = {
  contentType: string | null
  totalPieces: string | number
}

export type InWorldContentQuestions = {
  totalPieces: string | number
  totalUsers: string | number
  engagementMeasurement: string
}

export type SocialMediaContentQuestions = {
  socialMediaPlatforms: string | null
  audienceRelevance: string
  totalPieces: string | number
  totalPeopleImpact: string | number
  relevantLink: string
}

export type SponsorshipQuestions = {
  eventType: string
  eventCategory: string | null
  primarySourceFunding: string
  totalEvents: string | number
  totalAttendance: string | number
  audienceRelevance: string
  showcase: string
}

export type CoreUnitQuestions = {
  strategicValue: string
  impactMetrics: string
}

export type PlatformQuestions = {
  impactMetrics: string
}

export type CategoryAssessmentQuestions =
  | AcceleratorQuestions
  | CoreUnitQuestions
  | DocumentationQuestions
  | InWorldContentQuestions
  | SocialMediaContentQuestions
  | SponsorshipQuestions
  | PlatformQuestions

function getCategoryAssessmentSchema(category: NewGrantCategory) {
  switch (category) {
    case NewGrantCategory.Accelerator:
      return AcceleratorQuestionsSchema
    case NewGrantCategory.CoreUnit:
      return CoreUnitQuestionsSchema
    case NewGrantCategory.Documentation:
      return DocumentationQuestionsSchema
    case NewGrantCategory.InWorldContent:
      return InWorldContentQuestionsSchema
    case NewGrantCategory.SocialMediaContent:
      return SocialMediaContentQuestionsSchema
    case NewGrantCategory.Sponsorship:
      return SponsorshipQuestionsSchema
    case NewGrantCategory.Platform:
      return PlatformQuestionsSchema
  }
}

export function getGrantRequestSchema(category: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = cloneDeep(GrantRequestSchema)
  const parsedCategory: NewGrantCategory = toNewGrantCategory(category)
  const categoryName = camelCase(parsedCategory)
  schema.required = [...GrantRequestSchema.required, categoryName]
  const categoryAssessmentSchema = getCategoryAssessmentSchema(parsedCategory)
  schema.properties[categoryName] = {
    type: 'object',
    additionalProperties: false,
    required: [...Object.keys(categoryAssessmentSchema)],
    properties: categoryAssessmentSchema,
  }
  return schema
}
