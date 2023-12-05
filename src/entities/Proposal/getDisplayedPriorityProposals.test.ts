import { PriorityProposal, PriorityProposalType, ProposalStatus, ProposalType } from './types'
import { getDisplayedPriorityProposals } from './utils'

const ADDRESS = '0x549a9021661a85b6bc51c07b3a451135848d0048'

const VOTE_FOR_ADDRESS = {
  '0x549a9021661a85b6bc51c07b3a451135848d0048': {
    choice: 1,
    vp: 100,
    timestamp: 1700765065,
    metadata: {
      survey: [],
    },
  },
}

const ACTIVE_GOVERNANCE = {
  id: '50f83ede-c096-43f9-b74f-efecf715b8a1',
  title: 'Enable Operator Rights Option in Builder UI for Decentraland Worlds',
  user: '0x2684a202a374d87bb321a744482b89bf6deaf8bd',
  type: ProposalType.Governance,
  status: ProposalStatus.Active,
  start_at: new Date('2023-11-23T17:04:00.871Z'),
  finish_at: new Date('2023-12-07T17:04:00.867Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.ActiveGovernance,
  linked_proposals_data: [],
}

const OPEN_PITCH = {
  id: '5e88718c-dc45-40fc-9e3d-8c6f61a70662',
  title: 'Pitch',
  user: '0xcd15d83f42179b9a5b515eea0975f554444a9646',
  type: ProposalType.Pitch,
  status: ProposalStatus.Passed,
  start_at: new Date('2023-11-22T15:18:00.670Z'),
  finish_at: new Date('2023-11-22T15:38:00.670Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.OpenPitch,
  linked_proposals_data: [],
}

const PITCH_WITH_SUBMISSIONS = {
  id: '44cfe370-4463-11ee-ab1f-97157a05bdec',
  title: 'Dark Mode across more/all Decentraland platforms/sites',
  user: '0x5d327dcd9b4dae70ebf9c4ebb0576a1de97da520',
  type: ProposalType.Pitch,
  status: ProposalStatus.Passed,
  start_at: new Date('2023-08-26T22:52:00.199Z'),
  finish_at: new Date('2023-09-05T22:52:00.196Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.PitchWithSubmissions,
  linked_proposals_data: [
    {
      id: '5ed61c5e-03b1-423e-a80e-7740220b1386',
      start_at: new Date('2023-12-28T05:16:24.589+00:00'),
      finish_at: new Date('2024-01-11T05:16:24.589+00:00'),
      created_at: new Date('2023-11-28T05:16:00.59+00:00'),
    },
  ],
}

const PITCH_ON_TENDER_VOTING_PHASE = {
  id: '8c587d40-5243-11ee-baa4-e9e7a218fe1e',
  title: 'Decentraland DAO Headquarters',
  user: '0x5b5cc427c1d81db4f94de4d51d85ce122d63e244',
  type: ProposalType.Pitch,
  status: ProposalStatus.Passed,
  start_at: new Date('2023-09-13T14:40:00.597Z'),
  finish_at: new Date('2023-09-23T14:40:00.594Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.PitchOnTenderVotingPhase,
  linked_proposals_data: [
    {
      id: '67d96955-8972-476d-aa18-e21722b2725e',
      start_at: new Date('2023-11-17T18:02:08.556+00:00'),
      finish_at: new Date('2023-12-01T18:02:08.556+00:00'),
      created_at: new Date('2023-10-18T18:02:00.556+00:00'),
    },
    {
      id: 'eb74371e-27ea-4871-be3e-ac8a876d3838',
      start_at: new Date('2023-11-17T18:08:26.262+00:00'),
      finish_at: new Date('2023-12-01T18:08:26.262+00:00'),
      created_at: new Date('2023-10-18T18:08:00.263+00:00'),
    },
  ],
}

const OPEN_TENDER = {
  id: '5e88718c-dc45-40fc-9e3d-8c6f61a70666',
  title: 'Tender',
  user: '0xcd15d83f42179b9a5b515eea0975f554444a9646',
  type: ProposalType.Tender,
  status: ProposalStatus.Passed,
  start_at: new Date('2023-11-22T15:18:00.670Z'),
  finish_at: new Date('2023-11-22T15:38:00.670Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.OpenTender,
  linked_proposals_data: [],
}

const BID_AUTHOR_ADDRESS = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
const TENDER_WITH_SUBMISSIONS: PriorityProposal = {
  id: '5e88718c-dc45-40fc-9e3d-8c6f61a70666',
  title: 'Tender with submissions',
  user: '0xcd15d83f42179b9a5b515eea0975f554444a9646',
  type: ProposalType.Tender,
  status: ProposalStatus.Passed,
  start_at: new Date('2023-11-22T15:18:00.670Z'),
  finish_at: new Date('2023-11-22T15:38:00.670Z'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.TenderWithSubmissions,
  unpublished_bids_data: [
    {
      id: 10,
      linked_proposal_id: '5e88718c-dc45-40fc-9e3d-8c6f61a70666',
      author_address: BID_AUTHOR_ADDRESS,
      publish_at: '2023-10-18T18:02:00.556+00:00',
    },
    {
      id: 12,
      linked_proposal_id: '5e88718c-dc45-40fc-9e3d-8c6f61a70666',
      author_address: '0x5b5cc427c1d81db4f94de4d51d85ce122d63e244',
      publish_at: '2023-10-18T18:02:00.556+00:00',
    },
  ],
}

const ACTIVE_BID: PriorityProposal = {
  id: '5e88718c-dc45-40fc-9e3d-8c6f61a70669',
  title: 'Bid',
  user: '0xcd15d83f42179b9a5b515eea0975f554444a9646',
  type: ProposalType.Bid,
  status: ProposalStatus.Active,
  start_at: new Date('2023-10-18T18:02:00.556+00:00'),
  finish_at: new Date('2023-10-25T18:02:00.556+00:00'),
  snapshot_proposal: '',
  configuration: {},
  priority_type: PriorityProposalType.ActiveBid,
}

const ALL_PRIORITY_PROPOSALS: PriorityProposal[] = [
  ACTIVE_GOVERNANCE,
  OPEN_PITCH,
  PITCH_WITH_SUBMISSIONS,
  PITCH_ON_TENDER_VOTING_PHASE,
  OPEN_TENDER,
  TENDER_WITH_SUBMISSIONS,
  ACTIVE_BID,
]

describe('getDisplayedPriorityProposals', () => {
  describe('for all priority proposals', () => {
    const proposals = ALL_PRIORITY_PROPOSALS
    describe('when there are no votes', () => {
      const votes = {}
      it('should return all priority proposals', () => {
        const result = getDisplayedPriorityProposals(votes, proposals, ADDRESS)
        expect(result).toEqual(proposals)
      })
    })
  })

  describe('for an active governance proposal ', () => {
    const proposal = [ACTIVE_GOVERNANCE]
    describe('when there are votes for the proposal', () => {
      const votes = { [ACTIVE_GOVERNANCE.id]: VOTE_FOR_ADDRESS }
      it('should filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual([])
      })
    })
  })

  describe('for an open pitch ', () => {
    const proposal = [OPEN_PITCH]
    describe('when there are votes for the proposal', () => {
      const votes = { [OPEN_PITCH.id]: VOTE_FOR_ADDRESS }
      it('should filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual([])
      })
    })
  })

  describe('for a pitch with submissions', () => {
    const proposal = [PITCH_WITH_SUBMISSIONS]
    describe('when there are votes for the proposal', () => {
      it('should not filter the proposal', () => {
        const votes = { [PITCH_WITH_SUBMISSIONS.id]: VOTE_FOR_ADDRESS }
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual(proposal)
      })
    })
  })

  describe('for a pitch on tender voting phase', () => {
    const proposal = [PITCH_ON_TENDER_VOTING_PHASE]
    describe('when there are votes for the proposal', () => {
      const votes = { [PITCH_ON_TENDER_VOTING_PHASE.id]: VOTE_FOR_ADDRESS }
      it('should not filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual(proposal)
      })
      describe('and there are votes for one the linked proposals', () => {
        const votes = {
          [PITCH_ON_TENDER_VOTING_PHASE.id]: VOTE_FOR_ADDRESS,
          [PITCH_ON_TENDER_VOTING_PHASE.linked_proposals_data[0].id]: VOTE_FOR_ADDRESS,
        }
        it('should filter the proposal', () => {
          const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
          expect(result).toEqual([])
        })
      })
    })

    describe('when there are only votes for one the linked proposals', () => {
      const votes = { [PITCH_ON_TENDER_VOTING_PHASE.linked_proposals_data[0].id]: VOTE_FOR_ADDRESS }
      it('should filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual([])
      })
    })
  })

  describe('for an open tender proposal', () => {
    const proposal = [OPEN_TENDER]
    describe('when there are votes for the proposal', () => {
      const votes = { [OPEN_TENDER.id]: VOTE_FOR_ADDRESS }
      it('should filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual([])
      })
    })
  })

  describe('for an tender with unpublished bids', () => {
    const proposal = [TENDER_WITH_SUBMISSIONS]
    describe('when there are votes for the proposal', () => {
      const votes = { [TENDER_WITH_SUBMISSIONS.id]: VOTE_FOR_ADDRESS }
      it('should not filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual(proposal)
      })
      it('should filter the proposal if the user authored a bid', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, BID_AUTHOR_ADDRESS)
        expect(result).toEqual([])
      })
    })
    describe('when there are no votes for the proposal', () => {
      const votes = {}
      it('should filter the proposal if the user authored a bid', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, BID_AUTHOR_ADDRESS)
        expect(result).toEqual([])
      })
    })
  })

  describe('for an active bid', () => {
    const proposal = [ACTIVE_BID]
    describe('when there are votes for the proposal', () => {
      const votes = { [ACTIVE_BID.id]: VOTE_FOR_ADDRESS }
      it('should filter the proposal', () => {
        const result = getDisplayedPriorityProposals(votes, proposal, ADDRESS)
        expect(result).toEqual([])
      })
    })
  })
})
