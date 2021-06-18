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
        vp: balance.get(current.toLowerCase()) || 0,
        timestamp: Number(votes[current].msg.timestamp),
      }
      return result
    },
    {} as Record<string, Vote>
  )
}

export function calculateResult(choices: string[], votes: Record<string, Vote>, requiredVotingPower: number = 0) {
  let totalPower = 0
  const balance: Record<string, number> = {}
  const choiceCount: Record<string, number> = {}
  for (const choice of choices) {
    balance[choice] = 0
    choiceCount[choice] = 0
  }

  const voters = Object.keys(votes || {})
  for (const voter of voters) {
    const vote = votes![voter]!
    if (vote) {
      totalPower += vote.vp
      balance[choices[vote.choice - 1]] += vote.vp
      choiceCount[choices[vote.choice - 1]] += 1
    }
  }

  let rest = 100
  let maxProgress = 0
  let totalPowerProgress = Math.max(totalPower, requiredVotingPower)
  const result = choices.map((choice, i) => {
    const color = calculateChoiceColor(choice, i)
    const power = balance[choice] || 0
    const votes = choiceCount[choice] || 0

    if (totalPower === 0) {
      return {
        choice,
        color,
        votes,
        power: 0,
        progress: 0
      }
    }

    if (power === 0) {
      return {
        choice,
        color,
        votes,
        power: 0,
        progress: 0
      }
    }

    if (power === totalPowerProgress) {
      return {
        choice,
        color,
        votes,
        power,
        progress: 100
      }
    }

    let progress = Math.floor((power / totalPowerProgress) * 100)
    if (progress === 0) {
      progress = 1
    }

    rest -= progress

    if (progress > maxProgress) {
      maxProgress = progress
    }

    return {
      choice,
      power,
      votes,
      color,
      progress
    }
  })

  if (rest !== 0 && rest !== 100 && totalPower >= requiredVotingPower) {
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

export function calculateResultWinner(choices: string[], votes: Record<string, Vote>, requiredVotingPower: number = 0) {
  const result = calculateResult(choices, votes, requiredVotingPower)

  return result.reduce((winner, current) => {
    if (winner.power < current.power) {
      return current
    }

    return winner
  }, result[0])
}