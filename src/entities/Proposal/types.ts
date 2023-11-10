/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/ban-types */
import { SQLStatement } from 'decentraland-gatsby/dist/entities/Database/utils'

import { CommitteeName } from '../../clients/DclData'
import { SnapshotProposal } from '../../clients/SnapshotTypes'
import {
  CategoryAssessmentQuestions,
  GrantRequestDueDiligence,
  GrantRequestGeneralInfo,
  GrantRequestTeam,
  GrantTierType,
  PaymentToken,
  ProjectStatus,
  ProposalGrantCategory,
  SubtypeOptions,
  VestingStartDate,
} from '../Grant/types'
import { IndexedUpdate } from '../Updates/types'

import {
  MAX_NAME_SIZE,
  MIN_NAME_SIZE,
  VOTING_POWER_TO_PASS_BAN_NAME,
  VOTING_POWER_TO_PASS_BID,
  VOTING_POWER_TO_PASS_CATALYST,
  VOTING_POWER_TO_PASS_DRAFT,
  VOTING_POWER_TO_PASS_GOVERNANCE,
  VOTING_POWER_TO_PASS_HIRING,
  VOTING_POWER_TO_PASS_LINKED_WEARABLES,
  VOTING_POWER_TO_PASS_PITCH,
  VOTING_POWER_TO_PASS_POI,
  VOTING_POWER_TO_PASS_POLL,
  VOTING_POWER_TO_PASS_TENDER,
} from './constants'

export type ProposalAttributes<C extends Record<string, unknown> = any> = {
  id: string
  snapshot_id: string
  snapshot_space: string
  snapshot_proposal: any
  snapshot_network: string
  discourse_id: number
  discourse_topic_id: number
  discourse_topic_slug: string
  user: string
  title: string
  description: string
  type: ProposalType
  status: ProposalStatus
  configuration: C
  start_at: Date
  finish_at: Date
  deleted: boolean
  deleted_by: string | null
  enacted: boolean
  enacted_by: string | null
  enacted_description: string | null
  enacting_tx: string | null
  vesting_addresses: string[]
  passed_by: string | null
  passed_description: string | null
  rejected_by: string | null
  rejected_description: string | null
  required_to_pass: number | null
  created_at: Date
  updated_at: Date
  textsearch: SQLStatement | string | null | undefined
}

export type ProposalListFilter = {
  user: string
  type: ProposalType
  subtype?: SubtypeOptions
  status: ProposalStatus
  subscribed: boolean | string
  coauthor: boolean
  search?: string | null
  timeFrame?: string | null
  timeFrameKey?: string | null
  order?: SortingOrder
  snapshotIds?: string
  linkedProposalId?: string
}

export enum ProposalStatus {
  Pending = 'pending',
  Active = 'active',
  Finished = 'finished',
  Rejected = 'rejected',
  Passed = 'passed',
  OutOfBudget = 'out_of_budget',
  Enacted = 'enacted',
  Deleted = 'deleted',
}

export enum ProposalType {
  POI = 'poi',
  Catalyst = 'catalyst',
  BanName = 'ban_name',
  Grant = 'grant',
  LinkedWearables = 'linked_wearables',
  Hiring = 'hiring',
  Poll = 'poll',
  Draft = 'draft',
  Governance = 'governance',
  Pitch = 'pitch',
  Tender = 'tender',
  Bid = 'bid',
}

export enum SortingOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type GovernanceProcessType = ProposalType.Poll | ProposalType.Draft | ProposalType.Governance
export type BiddingProcessType = ProposalType.Pitch | ProposalType.Tender | ProposalType.Bid

export enum PoiType {
  AddPOI = 'add_poi',
  RemovePOI = 'remove_poi',
}

export enum HiringType {
  Add = 'hiring_add',
  Remove = 'hiring_remove',
}

export enum CatalystType {
  Add = 'catalyst_add',
  Remove = 'catalyst_remove',
}

export function isProposalType(value: string | null | undefined): boolean {
  if (value === null || value === undefined) {
    return false
  }

  return Object.values(ProposalType).includes(value as ProposalType)
}

export function isPoiType(value: string | null | undefined): boolean {
  switch (value) {
    case PoiType.AddPOI:
    case PoiType.RemovePOI:
      return true
    default:
      return false
  }
}

export function isCatalystType(value: string | null | undefined): boolean {
  switch (value) {
    case CatalystType.Add:
    case CatalystType.Remove:
      return true
    default:
      return false
  }
}

export function isSortingOrder(value: string | null | undefined): boolean {
  switch (value) {
    case SortingOrder.ASC:
    case SortingOrder.DESC:
      return true
    default:
      return false
  }
}

export function getPoiTypeAction(poiType: PoiType) {
  return poiType.split('_')[0] // "add" | "remove"
}

export function isHiringType(value: string | null | undefined): boolean {
  switch (value) {
    case HiringType.Add:
    case HiringType.Remove:
      return true
    default:
      return false
  }
}

export function toHiringType<T>(value: string | null | undefined, orElse: () => T): HiringType | T {
  return isHiringType(value) ? (value as HiringType) : orElse()
}

function requiredVotingPower(value: string | undefined | null, defaultValue: number) {
  if (value === undefined || value === null) {
    return defaultValue
  }

  const vp = Number(value.replace(/_/gi, ''))
  if (Number.isFinite(vp) && vp >= 0) {
    return vp
  }

  return defaultValue
}

export type UpdateProposalStatusProposal = {
  status: ProposalStatus.Rejected | ProposalStatus.Passed | ProposalStatus.Enacted
  vesting_addresses?: string[]
}

export const updateProposalStatusScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: [ProposalStatus.Rejected, ProposalStatus.Passed, ProposalStatus.Enacted],
    },
    vesting_addresses: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 42,
        maxLength: 42,
      },
    },
  },
}

export type NewProposalPoll = {
  title: string
  description: string
  choices: string[]
  coAuthors?: string[]
}

const coAuthors = {
  type: 'array',
  items: {
    type: 'string',
    minLength: 42,
    maxLength: 42,
  },
}

export const INVALID_PROPOSAL_POLL_OPTIONS = 'Invalid question/options'

export const newProposalPollScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'choices'],
  properties: {
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 80,
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 7000,
    },
    choices: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
      },
      minItems: 2,
    },
    coAuthors,
  },
}

export type NewProposalDraft = {
  linked_proposal_id: string
  title: string
  summary: string
  abstract: string
  motivation: string
  specification: string
  conclusion: string
  coAuthors?: string[]
}

export const newProposalDraftScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['linked_proposal_id', 'title', 'summary', 'abstract', 'motivation', 'specification', 'conclusion'],
  properties: {
    linked_proposal_id: {
      type: 'string',
      minLength: 36,
      maxLength: 255,
    },
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 80,
    },
    summary: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    },
    abstract: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    motivation: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    specification: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    conclusion: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    coAuthors,
  },
}

export type NewProposalGovernance = {
  linked_proposal_id: string
  title: string
  summary: string
  abstract: string
  motivation: string
  specification: string
  impacts: string
  implementation_pathways: string
  conclusion: string
  coAuthors?: string[]
}

export const newProposalGovernanceScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'linked_proposal_id',
    'title',
    'summary',
    'abstract',
    'motivation',
    'specification',
    'impacts',
    'implementation_pathways',
    'conclusion',
  ],
  properties: {
    linked_proposal_id: {
      type: 'string',
      minLength: 36,
      maxLength: 255,
    },
    title: {
      type: 'string',
      minLength: 5,
      maxLength: 80,
    },
    summary: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    },
    abstract: {
      type: 'string',
      minLength: 1,
      maxLength: 3500,
    },
    motivation: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    specification: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    impacts: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    implementation_pathways: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    conclusion: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    coAuthors,
  },
}

export type NewProposalBanName = {
  name: string
  description: string
  coAuthors?: string[]
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
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    },
    coAuthors,
  },
}

export type NewProposalPOI = {
  x: number
  y: number
  type: PoiType
  description: string
  coAuthors?: string[]
}

export const newProposalPOIScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y', 'type', 'description'],
  properties: {
    x: {
      type: 'integer',
      minimum: -150,
      maximum: 163,
    },
    y: {
      type: 'integer',
      minimum: -150,
      maximum: 159,
    },
    type: {
      type: 'string',
      enum: Object.values(PoiType),
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    },
    coAuthors,
  },
}

export type NewProposalHiring = {
  type: HiringType
  committee: CommitteeName
  address: string
  reasons: string
  evidence: string
  name?: string
  coAuthors?: string[]
}

export const newProposalHiringScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'committee', 'address', 'reasons', 'evidence'],
  properties: {
    type: {
      type: 'string',
      enum: Object.values(HiringType),
    },
    committee: {
      type: 'string',
      enum: Object.values(CommitteeName),
    },
    address: {
      type: 'string',
      format: 'address',
    },
    reasons: {
      type: 'string',
      minLength: 20,
      maxLength: 3000,
    },
    evidence: {
      type: 'string',
      minLength: 20,
      maxLength: 3000,
    },
    name: {
      type: 'string',
      minLength: MIN_NAME_SIZE,
      maxLength: MAX_NAME_SIZE,
    },
    coAuthors,
  },
}

export type NewProposalCatalyst = {
  owner: string
  domain: string
  description: string
  type: CatalystType
  coAuthors?: string[]
}

export const newProposalCatalystScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['owner', 'domain', 'description'],
  properties: {
    owner: {
      type: 'string',
      format: 'address',
    },
    domain: {
      type: 'string',
      format: 'hostname',
    },
    description: {
      type: 'string',
      minLength: 20,
      maxLength: 250,
    },
    type: {
      type: 'string',
      enum: Object.values(CatalystType),
    },
    coAuthors,
  },
}

export type NewProposalPitch = {
  initiative_name: string
  target_audience: string
  problem_statement: string
  proposed_solution: string
  relevance: string
  coAuthors?: string[]
}

export const newProposalPitchScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['initiative_name', 'target_audience', 'problem_statement', 'proposed_solution', 'relevance'],
  properties: {
    initiative_name: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    target_audience: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    problem_statement: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    proposed_solution: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    relevance: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    coAuthors,
  },
}

export type NewProposalTender = {
  linked_proposal_id: string
  project_name: string
  summary: string
  problem_statement: string
  technical_specification: string
  use_cases: string
  deliverables: string
  target_release_quarter: string
  coAuthors?: string[]
}

export const newProposalTenderScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'linked_proposal_id',
    'project_name',
    'summary',
    'problem_statement',
    'technical_specification',
    'use_cases',
    'deliverables',
    'target_release_quarter',
  ],
  properties: {
    linked_proposal_id: {
      type: 'string',
      minLength: 36,
      maxLength: 255,
    },
    project_name: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    summary: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    problem_statement: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    technical_specification: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    use_cases: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    deliverables: {
      type: 'string',
      minLength: 20,
      maxLength: 3500,
    },
    target_release_quarter: {
      type: 'string',
      maxLength: 7,
    },
    coAuthors,
  },
}

export const ProposalRequiredVP = {
  [ProposalType.LinkedWearables]: requiredVotingPower(VOTING_POWER_TO_PASS_LINKED_WEARABLES, 0),
  [ProposalType.Catalyst]: requiredVotingPower(VOTING_POWER_TO_PASS_CATALYST, 0),
  [ProposalType.BanName]: requiredVotingPower(VOTING_POWER_TO_PASS_BAN_NAME, 0),
  [ProposalType.POI]: requiredVotingPower(VOTING_POWER_TO_PASS_POI, 0),
  [ProposalType.Hiring]: requiredVotingPower(VOTING_POWER_TO_PASS_HIRING, 0),
  [ProposalType.Poll]: requiredVotingPower(VOTING_POWER_TO_PASS_POLL, 0),
  [ProposalType.Draft]: requiredVotingPower(VOTING_POWER_TO_PASS_DRAFT, 0),
  [ProposalType.Governance]: requiredVotingPower(VOTING_POWER_TO_PASS_GOVERNANCE, 0),
  [ProposalType.Pitch]: requiredVotingPower(VOTING_POWER_TO_PASS_PITCH, 0),
  [ProposalType.Tender]: requiredVotingPower(VOTING_POWER_TO_PASS_TENDER, 0),
  [ProposalType.Bid]: requiredVotingPower(VOTING_POWER_TO_PASS_BID, 0),
}

export type GrantProposalConfiguration = GrantRequestGeneralInfo &
  GrantRequestDueDiligence &
  GrantRequestTeam & {
    category: ProposalGrantCategory | null
    size: number
    paymentToken?: PaymentToken
    projectDuration?: number // Old grants may not have this field
    tier: GrantTierType
    choices: string[]
    vestingStartDate?: VestingStartDate
    categoryAssessment?: CategoryAssessmentQuestions
  }

export type NewProposalLinkedWearables = {
  name: string
  marketplace_link: string
  image_previews: string[]
  links: string[]
  nft_collections: string
  items: number
  smart_contract: string[]
  governance: string
  motivation: string
  managers: string[]
  programmatically_generated: boolean
  method: string
  coAuthors?: string[]
}

export const newProposalLinkedWearablesScheme = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'marketplace_link',
    'image_previews',
    'links',
    'nft_collections',
    'items',
    'smart_contract',
    'governance',
    'motivation',
    'managers',
    'programmatically_generated',
  ],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    marketplace_link: {
      type: 'string',
    },
    image_previews: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
      maxItems: 10,
    },
    links: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
    nft_collections: {
      type: 'string',
      minLength: 20,
      maxLength: 750,
    },
    items: {
      type: 'integer',
      minimum: 1,
      maximum: 99999,
    },
    smart_contract: {
      type: 'array',
      items: {
        type: 'string',
        format: 'address',
      },
      minItems: 1,
    },
    governance: {
      type: 'string',
      minLength: 20,
      maxLength: 750,
    },
    motivation: {
      type: 'string',
      minLength: 20,
      maxLength: 750,
    },
    managers: {
      type: 'array',
      items: {
        type: 'string',
        format: 'address',
      },
      minItems: 1,
    },
    programmatically_generated: {
      type: 'boolean',
    },
    method: {
      type: 'string',
      minLength: 0,
      maxLength: 750,
    },
    coAuthors,
  },
}

export type ProposalComment = {
  user_forum_id: number
  address?: string
  username: string
  avatar_url: string
  created_at: string
  cooked: string
}

export type ProposalCommentsInDiscourse = {
  totalComments: number
  comments: ProposalComment[]
}

export type VestingContractData = {
  vestedAmount: number
  releasable: number
  released: number
  start_at: number
  finish_at: number
  vesting_total_amount: number
}

export type Project = {
  id: string
  title: string
  user: string
  size: number
  type: ProposalType
  created_at: number
  configuration: {
    category: ProposalGrantCategory
    tier: string
  }
  status?: ProjectStatus
  contract?: VestingContractData
  enacting_tx?: string
  token?: string
  enacted_at?: number
  tx_amount?: number
  tx_date?: number
}

export type ProjectWithUpdate = Project & {
  update?: IndexedUpdate | null
  update_timestamp?: number
}

export type PendingProposalsQuery = { start: Date; end: Date; fields: (keyof SnapshotProposal)[]; limit: number }

export enum PriorityProposalType {
  ActiveGovernance = 'active_governance',
  OpenPitch = 'open_pitch',
  PitchWithSubmissions = 'pitch_with_submissions',
  PitchOnTenderVotingPhase = 'pitch_on_tender_voting_phase',
  OpenTender = 'open_tender',
  TenderWithSubmissions = 'tender_with_submissions',
  ActiveBid = 'active_bid',
}

export type PriorityProposal = Pick<
  ProposalAttributes,
  'id' | 'title' | 'finish_at' | 'start_at' | 'type' | 'status' | 'configuration' | 'user' | 'snapshot_proposal'
> & {
  priority_type: PriorityProposalType
  linked_proposals_data: LinkedProposal[]
}

export type LinkedProposal = Pick<ProposalAttributes, 'id' | 'finish_at' | 'start_at' | 'created_at'>
