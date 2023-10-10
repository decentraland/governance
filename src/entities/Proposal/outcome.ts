import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import orderBy from 'lodash/orderBy'

import { isProdEnv } from '../../utils/governanceEnvs'
import { Scores } from '../Votes/utils'

import { calculateWinnerChoice, getVotingResults, sameOptions } from './outcomeUtils'
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

export type Outcome = {
  winnerChoice: string
  winnerVotingPower: number
  outcomeStatus?: ProposalOutcome
}

export type ProposalWithOutcome = ProposalAttributes & Outcome

export const enum ProposalOutcome {
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  FINISHED = 'FINISHED',
}

const YES_NO_OPTIONS = ['yes', 'no']

const getOutcomeStatus = (
  winnerChoice: string,
  winnerVotingPower: number,
  choices: any,
  results: Scores,
  requiredToPass?: number | null
) => {
  const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
  const isUsingDefaultOptions = sameOptions(choices, DEFAULT_CHOICES) || sameOptions(choices, YES_NO_OPTIONS)

  const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
  const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])

  const minimumVotingPowerRequired = requiredToPass || 0
  if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired || winnerChoice === invalidOption) {
    return ProposalOutcome.REJECTED
  }

  if (isUsingDefaultOptions || isAcceptReject || isForAgainst) {
    if (
      (isUsingDefaultOptions && results['yes'] > results['no']) ||
      (isAcceptReject && results['accept'] > results['reject']) ||
      (isForAgainst && results['for'] > results['against'])
    ) {
      return ProposalOutcome.ACCEPTED
    }
    return ProposalOutcome.REJECTED
  }

  return ProposalOutcome.FINISHED
}

export async function calculateOutcome(proposal: ProposalAttributes, context: JobContext<Record<string, unknown>>) {
  try {
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const results = await getVotingResults(proposal, choices)
    const { winnerChoice, winnerVotingPower } = calculateWinnerChoice(results)

    return {
      winnerChoice,
      winnerVotingPower,
      outcomeStatus: getOutcomeStatus(winnerChoice, winnerVotingPower, choices, results, proposal.required_to_pass),
    }
  } catch (e) {
    if (isProdEnv()) {
      context.error(
        `Unable to calculate outcome for proposal: ${proposal.id}, snapshot id: ${proposal.snapshot_id}`,
        e as Error
      )
    }
  }
}

export function getWinnerBiddingAndTenderingProposal(
  pendingProposalsWithOutcome: ProposalWithOutcome[],
  linkedProposalId: string,
  type: ProposalType.Tender | ProposalType.Bid
) {
  const proposals = pendingProposalsWithOutcome.filter(
    (item) =>
      item.type === type &&
      item.configuration.linked_proposal_id === linkedProposalId &&
      item.outcomeStatus === ProposalOutcome.ACCEPTED
  )

  const sortedProposals = orderBy(proposals, 'winnerVotingPower', 'desc')
  const highestVotingPower = sortedProposals[0]?.winnerVotingPower
  const hasMultipleHighest = sortedProposals.filter((item) => item.winnerVotingPower === highestVotingPower).length > 1

  if (hasMultipleHighest) {
    return undefined
  }

  return sortedProposals[0]
}
