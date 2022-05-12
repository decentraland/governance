import { SnapshotVote } from "../../api/Snapshot"
import { VOTES_1, VOTES_2, VOTES_3, VOTES_4, VOTES_5 } from "./testData"
import { calculateMatch, MatchResult } from "./utils"

let userVotes: SnapshotVote[]
let candidateVotes: SnapshotVote[]

const EMPTY_MATCH_RESULT = { percentage: 0, voteDifference: 0, matches: [] }

describe('calculateMatch', () => {

  describe('If the user or candidate votes are null', () => {
    it('should return a 0 match percentage and an empty matches list', () => {
      expect(calculateMatch(null, [])).toStrictEqual(EMPTY_MATCH_RESULT)
      expect(calculateMatch([], null)).toStrictEqual(EMPTY_MATCH_RESULT)
    })
  })

  describe('If the user and candidate have not voted', () => {

    beforeEach(() => {
      userVotes = []
      candidateVotes = []
    })

    it('should return a 0 match percentage and an empty matches list', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = EMPTY_MATCH_RESULT
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If the user never voted and the candidate voted', () => {

    beforeEach(() => {
      userVotes = []
      candidateVotes = [...VOTES_1]
    })

    it('should return a 0 match percentage and an empty matches list', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = EMPTY_MATCH_RESULT
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If the candidate never voted and the user voted', () => {

    beforeEach(() => {
      userVotes = [...VOTES_1]
      candidateVotes = []
    })

    it('should return a 0 match percentage and an empty matches list', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = EMPTY_MATCH_RESULT
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If both voted on proposals that are all different', () => {

    beforeEach(() => {
      userVotes = [...VOTES_1]
      candidateVotes = [...VOTES_2]
    })

    it('should return a 0 match percentage and an empty matches list', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = EMPTY_MATCH_RESULT
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If both voted on the same proposals but do not match in any vote', () => {

    beforeEach(() => {
      userVotes = [...VOTES_1]
      candidateVotes = [...VOTES_3]
    })

    it('should return a 0 match percentage and the list with the proposals ids of the proposals voted by the candidate', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = {
        percentage: 0,
        voteDifference: 2,
        matches:
          [
            {
              proposal_id: 'QmYjzpzdp8z5nQZaavRtr5wuMXv3c6wHPAmx7Fs8QYsmBt',
              sameVote: false
            },
            {
              proposal_id: 'QmV4SbjZ5p71Wsrm43SqjtwqNpFNmKVYRSUL3WrHhwGdRC',
              sameVote: false
            },
          ]
      }
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If both voted on the same proposals and they matched the votes on all of them', () => {

    beforeEach(() => {
      userVotes = [...VOTES_1]
      candidateVotes = [...VOTES_4]
    })

    it('should return a 100 match percentage and the list with the proposals ids of the proposals voted by the candidate', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = {
        percentage: 100,
        voteDifference: 0,
        matches:
          [
            {
              proposal_id: 'QmYjzpzdp8z5nQZaavRtr5wuMXv3c6wHPAmx7Fs8QYsmBt',
              sameVote: true
            },
            {
              proposal_id: 'QmV4SbjZ5p71Wsrm43SqjtwqNpFNmKVYRSUL3WrHhwGdRC',
              sameVote: true
            },
          ]
      }
      expect(result).toStrictEqual(expected)
    })

  })

  describe('If both voted on the same 2 proposals and they matched the vote only in one of them', () => {

    beforeEach(() => {
      userVotes = [...VOTES_1]
      candidateVotes = [...VOTES_5]
    })

    it('should return a 50 match percentage and the list with the proposals ids of the proposals voted by the candidate', () => {
      const result = calculateMatch(userVotes, candidateVotes)
      const expected: MatchResult = {
        percentage: 50,
        voteDifference: 1,
        matches:
          [
            {
              proposal_id: 'QmYjzpzdp8z5nQZaavRtr5wuMXv3c6wHPAmx7Fs8QYsmBt',
              sameVote: true
            },
            {
              proposal_id: 'QmV4SbjZ5p71Wsrm43SqjtwqNpFNmKVYRSUL3WrHhwGdRC',
              sameVote: false
            },
          ]
      }
      expect(result).toStrictEqual(expected)
    })

  })
})
