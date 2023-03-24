import { Env } from '@dcl/ui-env'
import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { config } from '../../config'

import { calculateWinnerChoice, getVotingResults, sameOptions } from './outcomeUtils'
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes } from './types'
import { DEFAULT_CHOICES } from './utils'

export const enum ProposalOutcome {
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  FINISHED = 'FINISHED',
}

export type Outcome = {
  winnerChoice: string
  outcomeStatus?: ProposalOutcome
}

const YES_NO_OPTIONS = ['yes', 'no']

export async function calculateOutcome(proposal: ProposalAttributes, context: JobContext<Record<string, unknown>>) {
  try {
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const results = await getVotingResults(proposal, choices)
    const { winnerChoice, winnerVotingPower } = calculateWinnerChoice(results)

    const outcome: Outcome = {
      winnerChoice,
    }

    const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
    const isUsingDefaultOptions = sameOptions(choices, DEFAULT_CHOICES) || sameOptions(choices, YES_NO_OPTIONS)

    const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
    const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])

    const minimumVotingPowerRequired = proposal.required_to_pass || 0
    if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired) {
      outcome.outcomeStatus = ProposalOutcome.REJECTED
    } else if (winnerChoice === invalidOption) {
      outcome.outcomeStatus = ProposalOutcome.REJECTED
    } else if (isUsingDefaultOptions || isAcceptReject || isForAgainst) {
      if (
        (isUsingDefaultOptions && results['yes'] > results['no']) ||
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
