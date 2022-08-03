import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import UpdateModel from '../Updates/model'
import { getSnapshotProposalVotes, updateSnapshotProposalVotes } from '../Votes/routes'
import { Vote } from '../Votes/types'
import { Scores } from '../Votes/utils'

import ProposalModel from './model'
import { commentProposalUpdateInDiscourse } from './routes'
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes, ProposalStatus, ProposalType } from './types'

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

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposal()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const finishedProposals: ProposalAttributes[] = []
  const acceptedProposals: ProposalAttributes[] = []
  const rejectedProposals: ProposalAttributes[] = []

  for (const proposal of pendingProposals) {
    const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const isYesNo = sameOptions(choices, ['yes', 'no'])
    const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
    const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])
    const snapshotVotes = await getSnapshotProposalVotes(proposal)
    const votes: Record<string, Vote> = await updateSnapshotProposalVotes(proposal, snapshotVotes)
    const voters = Object.keys(votes)

    const result: Scores = {}
    for (const choice of choices) {
      result[choice] = 0
    }

    for (const voter of voters) {
      const vote = votes[voter]
      const choice = vote.choice - 1
      result[choices[choice]] = result[choices[choice]] + vote.vp
    }

    const winnerChoice = Object.keys(result).reduce((winner, choice) => {
      if (!winner || result[winner] < result[choice]) {
        return choice
      }

      return winner
    })

    const winnerVotingPower = Object.keys(result).reduce((winner, choice) => {
      if (!winner || winner < result[choice]) {
        return result[choice]
      }

      return winner
    }, 0)

    // reject empty proposals or proposals without the minimum vp required
    const minimumVotingPowerRequired = proposal.required_to_pass || 0
    if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired) {
      rejectedProposals.push(proposal)

      // reject if the invalid option won
    } else if (winnerChoice === invalidOption) {
      rejectedProposals.push(proposal)

      // reject/pass boolean proposals
    } else if (isYesNo || isAcceptReject || isForAgainst) {
      if (
        (isYesNo && result['yes'] > result['no']) ||
        (isAcceptReject && result['accept'] > result['reject']) ||
        (isForAgainst && result['for'] > result['against'])
      ) {
        acceptedProposals.push(proposal)
      } else {
        rejectedProposals.push(proposal)
      }

      // Finish otherwise
    } else {
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
