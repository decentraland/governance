import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { Scores } from '../Votes/utils'

import { ProposalAttributes } from './types'

export function sameOptions(options: string[], expected: string[]) {
  if (options.length !== expected.length) {
    return false
  }

  options = options.map((option) => option.toLowerCase()).sort()
  expected = expected.map((option) => option.toLowerCase()).sort()
  return options.every((option, i) => option === expected[i])
}

export function calculateWinnerChoice(result: Scores) {
  const winnerChoice = Object.keys(result)
    .filter((choice) => choice !== 'abstain')
    .reduce((winner, choice) => {
      if (!winner || result[winner] <= result[choice]) {
        return choice
      }
      return winner
    })
  const winnerVotingPower = result[winnerChoice]
  return { winnerChoice, winnerVotingPower }
}

export async function getVotingResults(proposal: ProposalAttributes<any>, choices: string[]) {
  const snapshotScores = await SnapshotGraphql.get().getProposalScores(proposal.snapshot_id)
  const result: Scores = {}
  for (const choice of choices) {
    result[choice] = snapshotScores[choices.indexOf(choice)]
  }
  return result
}
