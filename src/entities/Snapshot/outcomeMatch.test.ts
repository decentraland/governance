import { SnapshotVote } from '../../clients/SnapshotTypes'

import { VOTES_EXAMPLE } from './outcomeMatchData'
import { outcomeMatch } from './utils'

let userVotes: SnapshotVote[]

const USER_ADDRESS = 'user_address'
const ACTIVE_PROPOSAL = {
  id: 'proposal_id',
  title: 'proposal title',
  choices: ['yes', 'no'],
  score: [300, 0],
  state: 'active',
  author: '0x0000000000000000000000000000000000000000',
}

const VOTE_0_ACTIVE_PROPOSAL = {
  id: 'fakeId',
  choice: 0,
  created: 1,
  vp: 200,
  voter: 'address',
  proposal: ACTIVE_PROPOSAL,
}

const VOTE_1_NOT_MATCHING: SnapshotVote = {
  id: 'vote_id_1',
  voter: USER_ADDRESS,
  created: 1651525398,
  choice: 1,
  proposal: {
    id: 'proposal_id_1',
    title: 'Proposal Title',
    choices: ['yes', 'no'],
    scores: [0, 500],
    state: 'closed',
  },
}

const VOTE_2_NOT_MATCHING: SnapshotVote = {
  id: 'vote_id_2',
  voter: USER_ADDRESS,
  created: 1651525398,
  choice: 2,
  proposal: {
    id: 'proposal_id_2',
    title: 'Proposal Title',
    choices: ['yes', 'no'],
    scores: [500, 0],
    state: 'closed',
  },
}

const VOTE_3_MATCHES: SnapshotVote = {
  id: 'vote_id_3',
  voter: USER_ADDRESS,
  created: 1651525398,
  choice: 2,
  proposal: {
    id: 'proposal_id_3',
    title: 'Proposal Title',
    choices: ['yes', 'no'],
    scores: [500, 5000],
    state: 'closed',
  },
}

const VOTE_4_TIE: SnapshotVote = {
  id: 'vote_id_4',
  voter: USER_ADDRESS,
  created: 1651525398,
  choice: 2,
  proposal: {
    id: 'proposal_id_4',
    title: 'Proposal Title',
    choices: ['yes', 'no'],
    scores: [5000, 5000],
    state: 'closed',
  },
}

const VOTE_5_MATCHES: SnapshotVote = {
  id: 'vote_id_5',
  voter: USER_ADDRESS,
  created: 1651525398,
  choice: 1,
  proposal: {
    id: 'proposal_id_5',
    title: 'Proposal Title',
    choices: ['yes', 'no'],
    scores: [50000, 5000],
    state: 'closed',
  },
}

describe('outcomeMatch', () => {
  describe('If there are no votes for the user', () => {
    it('should return a 0 match percentage', () => {
      expect(outcomeMatch([])).toStrictEqual({ outcomeMatch: 0, totalProposals: 0 })
    })
  })

  describe('If the user only voted on a proposal that has not finished', () => {
    beforeEach(() => {
      userVotes = [VOTE_0_ACTIVE_PROPOSAL]
    })

    it('should return 0 outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 0, totalProposals: 0 })
    })
  })

  describe('If outcome did not match a vote', () => {
    beforeEach(() => {
      userVotes = [VOTE_1_NOT_MATCHING]
    })

    it('should return 0 outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 0, totalProposals: 1 })
    })
  })

  describe('If outcome did not match any vote', () => {
    beforeEach(() => {
      userVotes = [VOTE_0_ACTIVE_PROPOSAL, VOTE_1_NOT_MATCHING, VOTE_2_NOT_MATCHING, VOTE_4_TIE]
    })

    it('should return 0 outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 0, totalProposals: 3 })
    })
  })

  describe('If outcome matched a vote', () => {
    beforeEach(() => {
      userVotes = [VOTE_3_MATCHES]
    })

    it('should return 100 outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 100, totalProposals: 1 })
    })
  })

  describe('If outcome matched all votes', () => {
    beforeEach(() => {
      userVotes = [VOTE_3_MATCHES, VOTE_5_MATCHES]
    })

    it('should return 100 outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 100, totalProposals: 2 })
    })
  })

  describe('If outcome matched 2/5', () => {
    beforeEach(() => {
      userVotes = [
        VOTE_0_ACTIVE_PROPOSAL,
        VOTE_1_NOT_MATCHING,
        VOTE_2_NOT_MATCHING,
        VOTE_3_MATCHES,
        VOTE_4_TIE,
        VOTE_5_MATCHES,
      ]
    })

    it('should return the correct outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 40, totalProposals: 5 })
    })
  })

  describe('With several votes', () => {
    beforeEach(() => {
      userVotes = VOTES_EXAMPLE
    })

    it('should return the correct outcome match', () => {
      expect(outcomeMatch(userVotes)).toStrictEqual({ outcomeMatch: 89, totalProposals: 85 })
    })
  })
})
