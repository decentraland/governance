import { Scores } from '../Votes/utils'

import {
  ProposalWithOutcome,
  VotingOutcome,
  calculateVotingResult,
  getWinnerBiddingAndTenderingProposal,
} from './outcome'
import * as utils from './outcomeUtils'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

const DEFAULT_VALID_PROPOSAL: ProposalAttributes = {
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
    choices: [...DEFAULT_CHOICES],
  },
  start_at: new Date(),
  finish_at: new Date(),
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
  required_to_pass: 1,
  created_at: new Date(),
  updated_at: new Date(),
  textsearch: null,
}

const YES_NO_VALID_PROPOSAL: ProposalAttributes = {
  id: '14f39810-c289-11ed-931d-5b5c5c595273',
  snapshot_id: '0xdd438bbd8e2a9c22974f6f680ba29b6ced48f742b9ea8d91210dac34b7d0f49c',
  snapshot_space: 'snapshot.dcl.eth',
  snapshot_proposal: {
    space: {
      id: 'snapshot.dcl.eth',
    },
    type: 'single-choice',
    title: 'Add Endstate to the Linked Wearables Registry',
    body: 'body',
    choices: ['yes', 'no'],
    start: 1678812900,
    end: 1679417700,
    snapshot: '16827517',
    plugins: {},
    app: 'decentraland-governance',
    discussion: '',
    author: '0xBB7B59Afa3A0E5Be143b8fE9C641F00c1ecB9d69',
    created: 1678812954,
  },
  snapshot_network: '1',
  discourse_id: 77063,
  discourse_topic_id: 18435,
  discourse_topic_slug: 'dao-7d0f49c-add-endstate-to-the-linked-wearables-registry',
  user: '0x4f71e5f3cb3540c5a21e08e0744d786fb9e688ae',
  type: ProposalType.LinkedWearables,
  status: ProposalStatus.Active,
  title: 'Add Endstate to the Linked Wearables Registry',
  description: 'description',
  configuration: {
    name: 'Endstate',
    image_previews: [
      'https://tinypic.host/images/2023/03/14/drop0.jpg',
      'https://tinypic.host/images/2023/03/14/devonta.jpg',
    ],
    marketplace_link: 'https://opensea.io/endstate',
    links: ['https://www.endstate.io/', 'https://mint.endstate.io/DeVontaSmith'],
    nft_collections: 'text',
    items: 19,
    smart_contract: [
      '0x760aD43F304e49413bc9C50906425e16145F7A35',
      '0x9874382D53A6587abB7461d4aeF897Fd066Bbff7',
      '0x85F2B6c2aD91120B0D7bA901EcFe477Bc2216665',
      '0xfAfFb498E4B0d300fbAd20D09c3501E48C1532b7',
      '0x140197fBB6119F17311f414C367D238D181D085D',
      '0xd4EA80FfEE7d0E2A3132173C56baf604D20d40E5',
    ],
    governance: 'Proof of ownership of the verified Endstate Twitter account is attached.',
    motivation: 'text',
    managers: [
      '0xC39d677b064D263CbF2d090D79d28675471b661e',
      '0x4F71e5f3CB3540C5a21E08E0744D786Fb9e688AE',
      '0x088a9487E4f564F240cce4C4F78CC13e029793Bf',
    ],
    programmatically_generated: false,
    method: '',
    choices: ['yes', 'no'],
  },
  enacted: false,
  enacted_description: null,
  deleted: false,
  start_at: new Date('2023-03-14T16:55:00.617Z'),
  finish_at: new Date('2023-03-21T16:55:00.616Z'),
  created_at: new Date('2023-03-14T16:55:00.617Z'),
  updated_at: new Date('2023-03-21T16:55:00.236Z'),
  enacted_by: null,
  deleted_by: null,
  required_to_pass: 10,
  passed_by: null,
  passed_description: null,
  rejected_by: null,
  rejected_description: null,
  vesting_addresses: [],
  textsearch: null,
  enacting_tx: null,
}

function mockChoicesResult(results: Scores) {
  jest.spyOn(utils, 'getVotingResults').mockResolvedValue(results)
}

describe('calculateOutcome for options with abstain', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return the accepted outcome for a proposal with a valid winner and sufficient voting power', async () => {
    mockChoicesResult({ yes: 100, no: 0, abstain: 0 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.ACCEPTED)
  })
  it('should return the rejected outcome for a proposal with more voting power in No than Yes', async () => {
    mockChoicesResult({ yes: 100, no: 200, abstain: 0 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
  it('should return the accepted outcome for a proposal with more voting more voting power in Yes than No and majority Abstention', async () => {
    mockChoicesResult({ yes: 100, no: 50, abstain: 1000 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.ACCEPTED)
  })
  it('should return the rejected outcome for a proposal with only Abstention', async () => {
    mockChoicesResult({ yes: 0, no: 0, abstain: 1000 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
  it('should return the rejected outcome for a proposal with tie between Yes and No', async () => {
    mockChoicesResult({ yes: 100, no: 100, abstain: 0 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
  it('should return the accepted outcome for a proposal with tie between Yes and Abstain', async () => {
    mockChoicesResult({ yes: 100, no: 0, abstain: 100 })
    const outcome = await calculateVotingResult(DEFAULT_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.ACCEPTED)
  })
})

describe('calculateOutcome for legacy options', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return the accepted outcome for a proposal with a valid winner and sufficient voting power', async () => {
    mockChoicesResult({ yes: 100, no: 0 })
    const outcome = await calculateVotingResult(YES_NO_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('yes')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.ACCEPTED)
  })
  it('should return the rejected outcome for a proposal with more voting power in No than Yes', async () => {
    mockChoicesResult({ yes: 100, no: 200 })
    const outcome = await calculateVotingResult(YES_NO_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
  it('should return the rejected outcome for a proposal without votes', async () => {
    mockChoicesResult({ yes: 0, no: 0 })
    const outcome = await calculateVotingResult(YES_NO_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
  it('should return the rejected outcome for a proposal with tie between Yes and No', async () => {
    mockChoicesResult({ yes: 100, no: 100 })
    const outcome = await calculateVotingResult(YES_NO_VALID_PROPOSAL)
    expect(outcome).toBeDefined()
    expect(outcome?.winnerChoice).toBe('no')
    expect(outcome?.votingOutcome).toBe(VotingOutcome.REJECTED)
  })
})

describe('getWinnerBiddingAndTenderingProposal', () => {
  test('should return the matching tender proposal when there is only one matching proposal', () => {
    const proposals = [
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 10,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
    ] as ProposalWithOutcome[]
    const result = getWinnerBiddingAndTenderingProposal(proposals, '123', ProposalType.Tender)

    expect(result).toEqual({
      type: ProposalType.Tender,
      configuration: { linked_proposal_id: '123' },
      winnerVotingPower: 10,
      votingOutcome: VotingOutcome.ACCEPTED,
    })
  })

  test('should return the tender proposal with highest winnerVotingPower when there are multiple matching proposals', () => {
    const proposals = [
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 10,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
    ] as ProposalWithOutcome[]
    const result = getWinnerBiddingAndTenderingProposal(proposals, '123', ProposalType.Tender)

    expect(result).toEqual({
      type: ProposalType.Tender,
      configuration: { linked_proposal_id: '123' },
      winnerVotingPower: 15,
      votingOutcome: VotingOutcome.ACCEPTED,
    })
  })

  test('should return undefined when there are no matching tender proposals', () => {
    const proposals = [
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '456' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
    ] as ProposalWithOutcome[]
    const result = getWinnerBiddingAndTenderingProposal(proposals, '123', ProposalType.Tender)

    expect(result).toBeUndefined()
  })

  test('should return the correct proposal when there are tender proposals from different pitch proposals', () => {
    const proposals = [
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 10,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '456' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
    ] as ProposalWithOutcome[]
    const result = getWinnerBiddingAndTenderingProposal(proposals, '123', ProposalType.Tender)

    expect(result).toEqual({
      type: ProposalType.Tender,
      configuration: { linked_proposal_id: '123' },
      winnerVotingPower: 15,
      votingOutcome: VotingOutcome.ACCEPTED,
    })
  })

  test('should return undefined with there are multiple proposals with the same highest voting power', () => {
    const proposals = [
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '456' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 15,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Tender,
        configuration: { linked_proposal_id: '123' },
        winnerVotingPower: 10,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
      {
        type: ProposalType.Bid,
        configuration: { linked_proposal_id: '789' },
        winnerVotingPower: 8,
        votingOutcome: VotingOutcome.ACCEPTED,
      },
    ] as ProposalWithOutcome[]
    const result = getWinnerBiddingAndTenderingProposal(proposals, '123', ProposalType.Tender)

    expect(result).toBeUndefined()
  })
})
