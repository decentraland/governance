import { Scores } from '../Votes/utils'

import { ProposalOutcome, calculateOutcome } from './outcome'
import * as utils from './outcomeUtils'
import { JOB_CONTEXT_MOCK } from './testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

const VALID_PROPOSAL: ProposalAttributes = {
  id: '1',
  snapshot_id: 'snapshot_1',
  snapshot_space: 'snapshot_space_1',
  snapshot_proposal: {},
  snapshot_network: 'snapshot_network_1',
  discourse_id: 1,
  discourse_topic_id: 1,
  discourse_topic_slug: 'discourse_topic_slug_1',
  user: 'user_1',
  title: 'title_1',
  description: 'description_1',
  type: ProposalType.POI,
  status: ProposalStatus.Active,
  configuration: {
    choices: [...DEFAULT_CHOICES.map((choice) => choice.toLowerCase())],
  },
  start_at: new Date(),
  finish_at: new Date(),
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
  required_to_pass: 1,
  created_at: new Date(),
  updated_at: new Date(),
  textsearch: null,
}

function mockChoicesResult(results: Scores) {
  jest.spyOn(utils, 'getVotingResults').mockResolvedValue(results)
}

describe('calculateOutcome', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return the accepted outcome for a proposal with a valid winner and sufficient voting power', async () => {
    mockChoicesResult({ yes: 100, no: 0, abstain: 0 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.ACCEPTED)
  })
  it('should return the rejected outcome for a proposal with more voting power in No than Yes', async () => {
    mockChoicesResult({ yes: 100, no: 200, abstain: 0 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.REJECTED)
  })
  it('should return the accepted outcome for a proposal with more voting more voting power in Yes than No and majority Abstention', async () => {
    mockChoicesResult({ yes: 100, no: 50, abstain: 1000 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.ACCEPTED)
  })
  it('should return the rejected outcome for a proposal with only Abstention', async () => {
    mockChoicesResult({ yes: 0, no: 0, abstain: 1000 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.REJECTED)
  })
  it('should return the rejected outcome for a proposal with tie between Yes and No', async () => {
    mockChoicesResult({ yes: 100, no: 100, abstain: 0 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.REJECTED)
  })
  it('should return the accepted outcome for a proposal with tie between Yes and Abstain', async () => {
    mockChoicesResult({ yes: 100, no: 0, abstain: 100 })
    const outcome = await calculateOutcome(VALID_PROPOSAL, JOB_CONTEXT_MOCK)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.outcomeStatus).toBe(ProposalOutcome.ACCEPTED)
  })
})
