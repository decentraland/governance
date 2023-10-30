// eslint-disable @typescript-eslint/no-explicit-any
import crypto from 'crypto'

import Time from '../../utils/date/Time'
import { Budget } from '../Budget/types'
import { GrantTier } from '../Grant/GrantTier'
import { NewGrantCategory, VestingStartDate } from '../Grant/types'

import { VotingOutcome, VotingResult } from './outcome'
import { NewProposalGovernance, ProposalAttributes, ProposalRequiredVP, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

const start = new Date('2023-02-01T00:00:00.000Z')
const SNAPSHOT_DURATION = 600
const TEST_GRANT_SIZE = 10000
const TEST_PROPOSAL_USER = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'

export const REJECTED_OUTCOME: VotingResult = {
  winnerChoice: DEFAULT_CHOICES[1],
  winnerVotingPower: 100,
  votingOutcome: VotingOutcome.REJECTED,
}
export const ACCEPTED_OUTCOME: VotingResult = {
  winnerChoice: DEFAULT_CHOICES[0],
  winnerVotingPower: 200,
  votingOutcome: VotingOutcome.ACCEPTED,
}
export const FINISHED_OUTCOME: VotingResult = {
  winnerChoice: DEFAULT_CHOICES[0],
  winnerVotingPower: 200,
  votingOutcome: VotingOutcome.FINISHED,
}

export const POI_PROPOSAL_CONFIGURATION = {
  x: 15,
  y: 30,
  description: 'POI description',
  choices: DEFAULT_CHOICES,
}

export const GOVERNANCE_PROPOSAL_CONFIGURATION: NewProposalGovernance = {
  linked_proposal_id: 'draft-id',
  title: 'Governance Test Proposal',
  summary: 'Governance Test Proposal Summary',
  abstract: 'Governance Test Proposal Abstract',
  motivation: 'Governance Test Proposal Motivation',
  specification: 'Governance Test Proposal specification',
  impacts: 'Governance Test Proposal impacts',
  implementation_pathways: 'Governance Test Proposal implementation',
  conclusion: 'Governance Test Proposal conclusion',
  coAuthors: undefined,
}

function getGrantConfiguration(grantSize: number, grantCategory: NewGrantCategory) {
  return {
    abstract: '',
    beneficiary: '',
    description: '',
    email: '',
    personnel: '',
    roadmap: '',
    specification: '',
    title: '',
    category: grantCategory,
    projectDuration: 3,
    vestingStartDate: VestingStartDate.First,
    size: Number(grantSize),
    tier: GrantTier.getTypeFromBudget(grantSize),
    choices: DEFAULT_CHOICES,
  }
}

function getTestProposalConfiguration(
  proposalType: ProposalType,
  size?: number,
  grantCategory = NewGrantCategory.Accelerator
): any {
  if (proposalType === ProposalType.POI) {
    return POI_PROPOSAL_CONFIGURATION
  }
  if (proposalType === ProposalType.Governance) {
    return GOVERNANCE_PROPOSAL_CONFIGURATION
  }
  return getGrantConfiguration(size || TEST_GRANT_SIZE, grantCategory)
}

function getRequiredToPassThreshold(proposalType: ProposalType, grantSize?: number) {
  if (proposalType !== ProposalType.Grant) {
    return ProposalRequiredVP[proposalType]
  } else {
    if (!grantSize) {
      throw new Error('Unable to get required to pass threshold for Grant')
    }
    return GrantTier.getVPThreshold(grantSize)
  }
}

export function createTestProposal(
  proposalType: ProposalType,
  proposalStatus: ProposalStatus,
  grantSize?: number,
  grantCategory?: NewGrantCategory
): ProposalAttributes {
  const testProposalConfiguration = getTestProposalConfiguration(proposalType, grantSize, grantCategory)
  const id = crypto.randomUUID()
  return {
    ...BASIC_ATTRIBUTES,
    id: `id-${proposalType.toString()}-${proposalStatus.toString()}-${id}`,
    type: proposalType,
    required_to_pass: getRequiredToPassThreshold(proposalType, testProposalConfiguration?.size),
    configuration: testProposalConfiguration,
    title: `Test Proposal-${id}`,
    status: proposalStatus,
  }
}

export function createTestTender(id: string, linkedProposalId: string, status?: ProposalStatus): ProposalAttributes {
  return {
    id: id,
    type: ProposalType.Tender,
    configuration: { linked_proposal_id: linkedProposalId },
    required_to_pass: 1,
    title: `Test Tender-${id}`,
    status: status || ProposalStatus.Active,
    ...BASIC_ATTRIBUTES,
  }
}

export function createTestBid(id: string, linkedProposalId: string, status?: ProposalStatus): ProposalAttributes {
  return {
    id: id,
    type: ProposalType.Bid,
    configuration: { linked_proposal_id: linkedProposalId },
    required_to_pass: 1,
    title: `Test Bid-${id}`,
    status: status || ProposalStatus.Active,
    ...BASIC_ATTRIBUTES,
  }
}

const BASIC_ATTRIBUTES = {
  user: TEST_PROPOSAL_USER,
  description: 'Test proposal description',
  snapshot_id: 'snapshot id',
  snapshot_space: 'snapshot space',
  snapshot_proposal: null,
  snapshot_network: 'snapshot network',
  discourse_id: 333,
  discourse_topic_id: 444,
  discourse_topic_slug: 'discourse test topic slug',
  start_at: Time.utc(start).toDate(),
  finish_at: Time.utc(start).add(SNAPSHOT_DURATION, 'seconds').toDate(),
  deleted: false,
  deleted_by: null,
  enacted: false,
  enacted_by: null,
  enacted_description: null,
  enacting_tx: null,
  vesting_addresses: [],
  passed_by: null,
  passed_description: null,
  rejected_by: null,
  rejected_description: null,
  created_at: Time.utc(start).toDate(),
  updated_at: Time.utc(start).toDate(),
  textsearch: null,
}

export const ACCELERATOR_TOTAL = 105000
export const CORE_UNIT_TOTAL = 225225
export const GRANT_1_SIZE = 10000
export const GRANT_PROPOSAL_1 = createTestProposal(ProposalType.Grant, ProposalStatus.Active, GRANT_1_SIZE)
export const GRANT_2_SIZE = 5000
export const GRANT_PROPOSAL_2 = createTestProposal(ProposalType.Grant, ProposalStatus.Active, GRANT_2_SIZE)
export const GRANT_3_SIZE = 1000
export const GRANT_PROPOSAL_3 = createTestProposal(
  ProposalType.Grant,
  ProposalStatus.Active,
  GRANT_3_SIZE,
  NewGrantCategory.CoreUnit
)
export const POI_PROPOSAL: ProposalAttributes = createTestProposal(ProposalType.POI, ProposalStatus.Active)

export function getTestBudgetWithAvailableSize(
  availableForAccelerator?: number,
  availableForCoreUnit?: number
): Budget {
  const allocatedForAccelerator =
    availableForAccelerator !== undefined ? ACCELERATOR_TOTAL - availableForAccelerator : 5000
  availableForAccelerator = availableForAccelerator !== undefined ? availableForAccelerator : 100000

  const allocatedForCoreUnit = availableForCoreUnit !== undefined ? CORE_UNIT_TOTAL - availableForCoreUnit : 0
  availableForCoreUnit = availableForCoreUnit !== undefined ? availableForCoreUnit : 225225

  return {
    categories: {
      accelerator: {
        allocated: allocatedForAccelerator,
        available: availableForAccelerator,
        total: ACCELERATOR_TOTAL,
      },
      core_unit: {
        allocated: allocatedForCoreUnit,
        available: availableForCoreUnit,
        total: CORE_UNIT_TOTAL,
      },
      documentation: {
        allocated: 60000,
        available: -14955,
        total: 45045,
      },
      in_world_content: {
        allocated: 0,
        available: 300300,
        total: 300300,
      },
      platform: {
        allocated: 0,
        available: 600600,
        total: 600600,
      },
      social_media_content: {
        allocated: 0,
        available: 75075,
        total: 75075,
      },
      sponsorship: {
        allocated: 0,
        available: 150150,
        total: 150150,
      },
    },
    finish_at: Time.utc('2023-04-01T00:00:00.000Z').toDate(),
    start_at: Time.utc('2023-01-01T00:00:00.000Z').toDate(),
    total: 1501500,
    allocated: 285225 + allocatedForAccelerator + allocatedForCoreUnit,
    id: 'budget_id_1',
  }
}

export const CURRENT_TEST_BUDGET: Budget = {
  id: 'test-id',
  start_at: Time.utc('2023-01-01T00:00:00.000Z').toDate(),
  finish_at: Time.utc('2023-04-01T00:00:00.000Z').toDate(),
  total: 1155000,
  allocated: 0,
  categories: {
    accelerator: {
      total: 80850,
      allocated: 0,
      available: 80850,
    },
    core_unit: {
      total: 173250,
      allocated: 0,
      available: 173250,
    },
    documentation: {
      total: 34650,
      allocated: 0,
      available: 34650,
    },
    in_world_content: {
      total: 231000,
      allocated: 0,
      available: 231000,
    },
    platform: {
      total: 462000,
      allocated: 0,
      available: 462000,
    },
    social_media_content: {
      total: 57750,
      allocated: 0,
      available: 57750,
    },
    sponsorship: {
      total: 115500,
      allocated: 0,
      available: 115500,
    },
  },
}
