import { TestData } from '../../hooks/useVotingSectionTestData'

const DELEGATOR_1 = '0x521b0fef9cdcf250abaf8e7bc798cbe13fa98691'
const DELEGATOR_2 = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f92'
const DELEGATOR_3 = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f93'
const NON_VOTER_DELEGATOR = '0xe58d9940a395d303e691dbe0676710d9c1401000'
const ACCOUNT_DELEGATE = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f80'
const RANDOM_ACCOUNT = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f65'
const ACCOUNT: string = '0xcD15d83f42179b9A5B515eea0975f554444a9646' // use prod snapshot space

const CHOICE_3_VOTE = {
  choice: 3,
  vp: 2000,
  timestamp: 1950828044
}

const CHOICE_2_VOTE = {
  choice: 2,
  vp: 2000,
  timestamp: 1951828044
}

const DELEGATORS_VOTES = {
  [DELEGATOR_1]: CHOICE_3_VOTE,
  [DELEGATOR_2]: CHOICE_2_VOTE,
  [DELEGATOR_3]: CHOICE_3_VOTE,
  [RANDOM_ACCOUNT]: CHOICE_3_VOTE
}
const DELEGATE_VOTE = { [ACCOUNT_DELEGATE]: CHOICE_3_VOTE }
const ACCOUNT_VOTE = { [ACCOUNT]: CHOICE_3_VOTE }
const SAME_VOTES = { [ACCOUNT]: CHOICE_3_VOTE, [ACCOUNT_DELEGATE]: CHOICE_3_VOTE }
const DIFFERENT_VOTES = { [ACCOUNT]: CHOICE_2_VOTE, [ACCOUNT_DELEGATE]: CHOICE_3_VOTE }
const DELEGATORS = [DELEGATOR_1, DELEGATOR_2, DELEGATOR_3, NON_VOTER_DELEGATOR]

export const TEST_CHOICES:string[] = ['Yes, we need a VR client for Decentraland', 'Refund the DAO for the costs associated with this Grant', 'This option has 100chars 00000000000000 0000000000000 0000000000000000000000 000000 0000000000000 00']
export const OWN_VOTING_POWER = 111
export const DELEGATED_VOTING_POWER = 222
export const VOTE_DIFFERENCE =  3

export const TEST_CASES: Omit<TestData, 'choices' | 'ownVotingPower' | 'delegatedVotingPower' | 'voteDifference'>[] = [
  // --------------------------- NO DELEGATE - NO DELEGATORS
  {
    caseLabel: 'No Vote, No Dg, No Dr',
    votes: {},
    delegators: [],
    accountDelegate: null,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, No Dg, No Dr',
    votes: ACCOUNT_VOTE,
    delegators: [],
    accountDelegate: null,
    account: ACCOUNT
  },
  // --------------------------- WITH DELEGATE - NO DELEGATORS
  {
    caseLabel: 'No Vote, Dg, No Dr',
    votes: {},
    delegators: [],
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'No Vote, Dg Voted, No Dr',
    votes: DELEGATE_VOTE,
    delegators: [],
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg not Voted, No Dr',
    votes: ACCOUNT_VOTE,
    delegators: [],
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Same, No Dr',
    votes: SAME_VOTES,
    delegators: [],
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Differently, No Dr',
    votes: DIFFERENT_VOTES,
    delegators: [],
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  // --------------------------- NO DELEGATE - WITH DELEGATORS
  {
    caseLabel: 'No Vote, No Dg, Dr',
    votes: {},
    delegators: DELEGATORS,
    accountDelegate: null,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, No Dg, Dr',
    votes: ACCOUNT_VOTE,
    delegators: DELEGATORS,
    accountDelegate: null,
    account: ACCOUNT
  },
  {
    caseLabel: 'No Vote, No Dg, Dr Voted',
    votes: DELEGATORS_VOTES,
    delegators: DELEGATORS,
    accountDelegate: null,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg not Voted, Dr Voted',
    votes: {...ACCOUNT_VOTE, ...DELEGATORS_VOTES},
    delegators: DELEGATORS,
    accountDelegate: null,
    account: ACCOUNT
  },
  // --------------------------- WITH DELEGATE - WITH DELEGATORS
  {
    caseLabel: 'No Vote, Dg, Dr',
    votes: {},
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'No Vote, Dg Voted, Dr',
    votes: DELEGATE_VOTE,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg not Voted, Dr',
    votes: ACCOUNT_VOTE,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Same, Dr',
    votes: SAME_VOTES,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Differently, Dr',
    votes: DIFFERENT_VOTES,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  //---------------------------------------- WITH DELEGATORS VOTING
  {
    caseLabel: 'No Vote, Dg, Dr Votes',
    votes: DELEGATORS_VOTES,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'No Vote, Dg Voted, Dr Votes',
    votes: {...DELEGATE_VOTE, ...DELEGATORS_VOTES},
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg not Voted, Dr Votes',
    votes: {...ACCOUNT_VOTE, ...DELEGATORS_VOTES},
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Same, Dr Votes',
    votes: {...SAME_VOTES, ...DELEGATORS_VOTES},
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
  {
    caseLabel: 'Vote, Dg Voted Differently, Dr Votes',
    votes: {...DIFFERENT_VOTES, ...DELEGATORS_VOTES},
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE,
    account: ACCOUNT
  },
]
