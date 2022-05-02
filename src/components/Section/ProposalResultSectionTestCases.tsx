import { Vote } from '../../entities/Votes/types'

const choices = ['yes', 'no', 'maybe']
const DELEGATOR_1 = '0x521b0fef9cdcf250abaf8e7bc798cbe13fa98691'
const DELEGATOR_2 = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f92'
const DELEGATOR_3 = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f93'
const NON_VOTER_DELEGATOR = '0xe58d9940a395d303e691dbe0676710d9c1401000'
const ACCOUNT_DELEGATE = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f80'
const RANDOM_ACCOUNT = '0xd2d950cea649feef4d6111c18adbd9a37b3a9f65'
const account: string = '0x521b0fef9cdcf250abaf8e7bc798cbe13fa98690'

const CHOICE_1_VOTE = {
  choice: 1,
  vp: 2000,
  timestamp: 1650828044
}

const CHOICE_2_VOTE = {
  choice: 2,
  vp: 2000,
  timestamp: 1650828044
}

const ACCOUNT_AND_DELEGATORS_VOTED = {
  [account!]: CHOICE_1_VOTE,
  [DELEGATOR_1]: CHOICE_1_VOTE,
  [DELEGATOR_2]: CHOICE_2_VOTE,
  [DELEGATOR_3]: CHOICE_1_VOTE,
  [RANDOM_ACCOUNT]: CHOICE_1_VOTE
}
const VOTES_WITH_DELEGATORS = {
  [DELEGATOR_1]: CHOICE_1_VOTE,
  [DELEGATOR_2]: CHOICE_2_VOTE,
  [DELEGATOR_3]: CHOICE_1_VOTE,
  [RANDOM_ACCOUNT]: CHOICE_1_VOTE
}
const ONLY_DELEGATE_VOTE = { [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
const ACCOUNT_VOTE = { [account!]: CHOICE_1_VOTE }
const SAME_VOTES = { [account!]: CHOICE_1_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
const DIFFERENT_VOTES = { [account!]: CHOICE_2_VOTE, [ACCOUNT_DELEGATE]: CHOICE_1_VOTE }
const DELEGATORS = [DELEGATOR_1, DELEGATOR_2, DELEGATOR_3, NON_VOTER_DELEGATOR]
const votes = {} // ONLY_DELEGATE_VOTE
const delegators: string[] = [] //DELEGATORS
const delegate = ACCOUNT_DELEGATE
const hasEnoughVP = true

export interface TestData {
  votes: Record<string, Vote> | null | undefined
  delegators: string[]
  accountDelegate: string
  caseLabel: string
}

export const TEST_CASES: TestData[] = [
  {
    caseLabel: 'test name',
    votes: votes,
    delegators: DELEGATORS,
    accountDelegate: ACCOUNT_DELEGATE
  }
]
