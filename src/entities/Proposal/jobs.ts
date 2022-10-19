import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import UpdateModel from '../Updates/model'
import { Scores } from '../Votes/utils'

import ProposalModel from './model'
import { commentProposalUpdateInDiscourse } from './routes'
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes, ProposalStatus, ProposalType } from './types'

const enum ProposalOutcome {
  REJECTED,
  ACCEPTED,
  FINISHED,
}

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  context.log(activatedProposals === 0 ? `No activated proposals` : `Activated ${activatedProposals} proposals...`)
}

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

async function calculateOutcome(proposal: ProposalAttributes, context: JobContext<{}>) {
  try {
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const results = await getVotingResults(proposal, choices)
    const { winnerChoice, winnerVotingPower } = calculateWinnerChoice(results)

    const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
    const isYesNo = sameOptions(choices, ['yes', 'no'])
    const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
    const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])

    // reject empty proposal or proposal without the minimum vp required
    const minimumVotingPowerRequired = proposal.required_to_pass || 0
    if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired) {
      return ProposalOutcome.REJECTED

      // reject if the invalid option won
    } else if (winnerChoice === invalidOption) {
      return ProposalOutcome.REJECTED
      // reject/pass boolean proposal
    } else if (isYesNo || isAcceptReject || isForAgainst) {
      if (
        (isYesNo && results['yes'] > results['no']) ||
        (isAcceptReject && results['accept'] > results['reject']) ||
        (isForAgainst && results['for'] > results['against'])
      ) {
        return ProposalOutcome.ACCEPTED
      } else {
        return ProposalOutcome.REJECTED
      }
      // Finish otherwise
    } else {
      return ProposalOutcome.FINISHED
    }
  } catch (e) {
    context.error(`Unable to calculate outcome for ${proposal.snapshot_id}`, e as Error)
  }
}

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposals()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const finishedProposals: ProposalAttributes[] = []
  const acceptedProposals: ProposalAttributes[] = []
  const rejectedProposals: ProposalAttributes[] = []

  for (const proposal of pendingProposals) {
    const outcome = await calculateOutcome(proposal, context)
    switch (outcome) {
      case ProposalOutcome.REJECTED:
        rejectedProposals.push(proposal)
        break
      case ProposalOutcome.ACCEPTED:
        acceptedProposals.push(proposal)
        break
      case ProposalOutcome.FINISHED:
        finishedProposals.push(proposal)
    }
  }

  if (finishedProposals.length > 0) {
    context.log(`Finishing ${finishedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      finishedProposals.map((proposal) => proposal.id),
      ProposalStatus.Finished
    )
  }

  if (acceptedProposals.length > 0) {
    context.log(`Accepting ${acceptedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      acceptedProposals.map((proposal) => proposal.id),
      ProposalStatus.Passed
    )

    await Promise.all(
      acceptedProposals.map(async (proposal) => {
        if (proposal.type == ProposalType.Grant) {
          await UpdateModel.createPendingUpdates(proposal.id, proposal.configuration.tier)
        }
      })
    )
  }

  if (rejectedProposals.length > 0) {
    context.log(`Rejecting ${rejectedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      rejectedProposals.map((proposal) => proposal.id),
      ProposalStatus.Rejected
    )
  }

  //
  // Update proposal in Discourse
  //
  const proposals: ProposalAttributes[] = [...finishedProposals, ...acceptedProposals, ...rejectedProposals]
  context.log(`Updating ${proposals.length} proposals in discourse... \n\n`)
  for (const proposal of proposals) {
    commentProposalUpdateInDiscourse(proposal.id)
  }
}
