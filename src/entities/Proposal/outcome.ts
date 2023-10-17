import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import orderBy from 'lodash/orderBy'

import { isProdEnv } from '../../utils/governanceEnvs'
import { Scores } from '../Votes/utils'

import { calculateWinnerChoice, getVotingResults, sameOptions } from './outcomeUtils'
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { DEFAULT_CHOICES } from './utils'

export const enum VotingOutcome {
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  FINISHED = 'FINISHED',
}

export type VotingResult = {
  winnerChoice: string
  winnerVotingPower: number
  votingOutcome?: VotingOutcome
}

export type ProposalVotingResult = ProposalAttributes & VotingResult
export type ProposalWithOutcome = ProposalVotingResult & { newStatus: ProposalStatus }

const YES_NO_OPTIONS = ['yes', 'no']

const getVotingOutcome = (
  winnerChoice: string,
  winnerVotingPower: number,
  choices: any,
  results: Scores,
  requiredToPass?: number | null
): VotingOutcome => {
  const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
  const isUsingDefaultOptions = sameOptions(choices, DEFAULT_CHOICES) || sameOptions(choices, YES_NO_OPTIONS)

  const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
  const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])

  const minimumVotingPowerRequired = requiredToPass || 0
  if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired || winnerChoice === invalidOption) {
    return VotingOutcome.REJECTED
  }

  if (isUsingDefaultOptions || isAcceptReject || isForAgainst) {
    if (
      (isUsingDefaultOptions && results['yes'] > results['no']) ||
      (isAcceptReject && results['accept'] > results['reject']) ||
      (isForAgainst && results['for'] > results['against'])
    ) {
      return VotingOutcome.ACCEPTED
    }
    return VotingOutcome.REJECTED
  }

  return VotingOutcome.FINISHED
}

export async function calculateVotingResult(proposal: ProposalAttributes): Promise<VotingResult | undefined> {
  try {
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const results = await getVotingResults(proposal, choices)
    const { winnerChoice, winnerVotingPower } = calculateWinnerChoice(results)

    return {
      winnerChoice,
      winnerVotingPower,
      votingOutcome: getVotingOutcome(winnerChoice, winnerVotingPower, choices, results, proposal.required_to_pass),
    }
  } catch (e) {
    if (isProdEnv()) {
      logger.error(
        `Unable to calculate outcome for proposal: ${proposal.id}, snapshot id: ${proposal.snapshot_id}`,
        e as Error
      )
    }
  }
}

export function getWinnerBiddingAndTenderingProposal(
  proposalsWithVotingResult: ProposalVotingResult[],
  linkedProposalId: string,
  type: ProposalType.Tender | ProposalType.Bid
) {
  const proposals = proposalsWithVotingResult.filter(
    (item) =>
      item.type === type &&
      item.configuration.linked_proposal_id === linkedProposalId &&
      item.votingOutcome === VotingOutcome.ACCEPTED
  )

  const sortedProposals = orderBy(proposals, 'winnerVotingPower', 'desc')
  const highestVotingPower = sortedProposals[0]?.winnerVotingPower
  const hasMultipleHighest = sortedProposals.filter((item) => item.winnerVotingPower === highestVotingPower).length > 1

  if (hasMultipleHighest) {
    return undefined
  }

  return sortedProposals[0]
}
