import isUUID from 'validator/lib/isUUID'
import { SnapshotVote } from '../../api/Snapshot';
import { ChoiceColor, Vote } from './types';

export function toProposalIds(ids?: undefined | null | string | string[]) {
  if (!ids) {
    return []
  }

  const list = Array.isArray(ids)? ids : [ ids ]

  return list.filter(id => isUUID(String(id)))
}

export function createVotes(votes: Record<string, SnapshotVote>, balances: Record<string, number>) {
  const balance = new Map(Object.keys(balances).map(address => [ address.toLowerCase(), balances[address] || 0] as const))
  return Object.keys(votes).reduce(
    (result, current) => {
      result[current.toLowerCase()] = {
        choice: votes[current].msg.payload.choice,
        vp: balance.get(current.toLowerCase()) || 0
      }
      return result
    },
    {} as Record<string, Vote>
  )
}

export function calculateResult(choices: string[], votes: Record<string, Vote>) {
  let total = 0
  const balance: Record<string, number> = {}
  for (const choice of choices) {
    balance[choice] = 0
  }

  const voters = Object.keys(votes || {})
  for (const voter of voters) {
    const vote = votes![voter]!
    if (vote) {
      total += vote.vp
      balance[choices[vote.choice - 1]] += vote.vp
    }
  }

  let rest = 100
  let maxProgress = 0
  const result = choices.map((choice, i) => {
    const color = calculateChoiceColor(choice, i)
    if (total === 0) {
      return {
        choice,
        color,
        votes: 0,
        progress: 0
      }
    }

    const votes = balance[choice] || 0
    if (votes === 0) {
      return {
        choice,
        color,
        votes: 0,
        progress: 0
      }
    }

    if (votes === total) {
      return {
        choice,
        votes,
        color,
        progress: 100
      }
    }

    let progress = Math.floor((votes / total) * 100)
    if (progress === 0) {
      progress = 1
    }

    rest -= progress

    if (progress > maxProgress) {
      maxProgress = progress
    }

    return {
      choice,
      votes,
      color,
      progress
    }
  })

  if (rest !== 0 && rest !== 100) {
    const maxChoiceResults = result.filter(choiceResult => choiceResult.progress === maxProgress)
    for (const choiceResult of maxChoiceResults) {
      choiceResult.progress += rest / maxChoiceResults.length
    }
  }

  return result
}

export function calculateChoiceColor(value: string, index: number): ChoiceColor {
  switch (value.toLowerCase()) {
    case 'yes':
    case 'for':
    case 'approve':
      return 'approve';

    case 'no':
    case 'against':
    case 'reject':
      return 'reject';

    default:
      return index % 8
  }
}

export function calculateResultWinner(choices: string[], votes: Record<string, Vote>) {
  const result = calculateResult(choices, votes)

  return result.reduce((winner, current) => {
    if (winner.votes < current.votes) {
      return current
    }

    return winner
  }, result[0])
}