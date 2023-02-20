import { Env } from '@dcl/ui-env'
import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { config } from '../../config'
import { Scores } from '../Votes/utils'

import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes } from './types'

function sameOptions(options: string[], expected: string[]) {
  if (options.length !== expected.length) {
    return false
  }

  options = options.map((option) => option.toLowerCase()).sort()
  expected = expected.map((option) => option.toLowerCase()).sort()
  return options.every((option, i) => option === expected[i])
}

function calculateWinnerChoice(result: Scores) {
  const winnerChoice = Object.keys(result).reduce((winner, choice) => {
    if (!winner || result[winner] < result[choice]) {
      return choice
    }
    return winner
  })
  const winnerVotingPower = result[winnerChoice]
  return { winnerChoice, winnerVotingPower }
}

async function getVotingResults(proposal: ProposalAttributes<any>, choices: string[]) {
  const snapshotScores = await SnapshotGraphql.get().getProposalScores(proposal.snapshot_id)
  const result: Scores = {}
  for (const choice of choices) {
    result[choice] = snapshotScores[choices.indexOf(choice)]
  }
  return result
}

export const enum ProposalOutcome {
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  FINISHED = 'FINISHED',
}

export type Outcome = {
  winnerChoice: string
  outcomeStatus?: ProposalOutcome
}

export async function calculateOutcome(proposal: ProposalAttributes, context: JobContext<Record<string, unknown>>) {
  try {
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const results = await getVotingResults(proposal, choices)
    const { winnerChoice, winnerVotingPower } = calculateWinnerChoice(results)

    const outcome: Outcome = {
      winnerChoice,
    }

    const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
    const isYesNo = sameOptions(choices, ['yes', 'no'])
    const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
    const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])

    const minimumVotingPowerRequired = proposal.required_to_pass || 0
    if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired) {
      outcome.outcomeStatus = ProposalOutcome.REJECTED
    } else if (winnerChoice === invalidOption) {
      outcome.outcomeStatus = ProposalOutcome.REJECTED
    } else if (isYesNo || isAcceptReject || isForAgainst) {
      if (
        (isYesNo && results['yes'] > results['no']) ||
        (isAcceptReject && results['accept'] > results['reject']) ||
        (isForAgainst && results['for'] > results['against'])
      ) {
        outcome.outcomeStatus = ProposalOutcome.ACCEPTED
      } else {
        outcome.outcomeStatus = ProposalOutcome.REJECTED
      }
    } else {
      outcome.outcomeStatus = ProposalOutcome.FINISHED
    }

    return outcome
  } catch (e) {
    //TODO: move this logging decisions to the ErrorService
    if (config.getEnv() !== Env.LOCAL && config.getEnv() !== Env.DEVELOPMENT) {
      context.error(
        `Unable to calculate outcome for proposal: ${proposal.id}, snapshot id: ${proposal.snapshot_id}`,
        e as Error
      )
    }
  }
}
