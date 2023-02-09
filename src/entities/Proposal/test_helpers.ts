import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { GrantTier } from '../Grant/GrantTier'
import { NewGrantCategory, VestingStartDate } from '../Grant/types'

import { ProposalAttributes, ProposalRequiredVP, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

const start = Time.utc().set('seconds', 0)
const SNAPSHOT_DURATION = 600
const TEST_GRANT_SIZE = 22000

function getGrantConfiguration(grantSize: number) {
  return {
    abstract: '',
    beneficiary: '',
    description: '',
    email: '',
    personnel: '',
    roadmap: '',
    specification: '',
    title: '',
    category: NewGrantCategory.Accelerator,
    projectDuration: 3,
    vestingStartDate: VestingStartDate.First,
    size: Number(grantSize),
    tier: GrantTier.getTypeFromBudget(grantSize),
    choices: DEFAULT_CHOICES,
  }
}

export const POI_PROPOSAL_CONFIGURATION = {
  x: 15,
  y: 30,
  description: 'POI description',
  choices: DEFAULT_CHOICES,
}

function getTestProposalConfiguration(proposalType: ProposalType): any {
  if (proposalType === ProposalType.POI) {
    return POI_PROPOSAL_CONFIGURATION
  }
  return getGrantConfiguration(TEST_GRANT_SIZE)
}

const TEST_PROPOSAL_USER = '0xProposalCreatorUserAddress'

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

export function createTestProposal(proposalType: ProposalType, proposalStatus: ProposalStatus): ProposalAttributes {
  const testProposalConfiguration = getTestProposalConfiguration(proposalType)
  return {
    id: `id-${proposalType.toString()}-${proposalStatus.toString()}`,
    type: proposalType,
    user: TEST_PROPOSAL_USER,
    required_to_pass: getRequiredToPassThreshold(proposalType, testProposalConfiguration?.size),
    configuration: JSON.stringify(testProposalConfiguration),
    title: 'Test Proposal',
    description: 'Test proposal description',
    status: proposalStatus,
    snapshot_id: 'snapshot test id',
    snapshot_space: 'snapshot test space',
    snapshot_proposal: null,
    snapshot_network: 'snapshot network',
    discourse_id: 333,
    discourse_topic_id: 444,
    discourse_topic_slug: 'discourse test topic slug',
    start_at: start.toJSON() as never,
    finish_at: Time.utc(start).add(SNAPSHOT_DURATION, 'seconds').toJSON() as never,
    deleted: false,
    deleted_by: null,
    enacted: false,
    enacted_by: null,
    enacted_description: null,
    enacting_tx: null,
    vesting_address: null,
    passed_by: null,
    passed_description: null,
    rejected_by: null,
    rejected_description: null,
    created_at: start.toJSON() as never,
    updated_at: start.toJSON() as never,
    textsearch: null,
  }
}
