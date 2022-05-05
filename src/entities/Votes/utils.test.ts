import { calculateResult, calculateResultWinner} from './utils'
import {
  YES_NO_CHOICES,
  VOTES_RESULTS,
} from './utils.testData'

describe('entities/Votes/utils', () => {
  test('calculateResult', () => {
    expect(calculateResult(YES_NO_CHOICES, VOTES_RESULTS)).toEqual([
      {
        choice: 'yes',
        power: 4322367,
        votes: 21,
        color: 'approve',
        progress: 68,
      },
      {
        choice: 'no',
        power: 2065731,
        votes: 75,
        color: 'reject',
        progress: 32,
      },
    ])
  })

  test('calculateResultWinner', () => {
    expect(calculateResultWinner(YES_NO_CHOICES, VOTES_RESULTS)).toEqual({
      choice: 'yes',
      power: 4322367,
      votes: 21,
      color: 'approve',
      progress: 68,
    })
  })
})


