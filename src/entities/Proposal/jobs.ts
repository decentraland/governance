import JobContext from "decentraland-gatsby/dist/entities/Job/context";
import VotesModel from "../Votes/model";
import { Vote } from "../Votes/types";
import ProposalModel from "./model";
import { ProposalAttributes, ProposalStatus } from "./types";

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  context.log(`Activated ${activatedProposals} proposals...`)
}

function sameOptions(options: string[], expected: string[]) {
  if (options.length !== expected.length) {
    return false
  }

  options = options.map(option => option.toLowerCase()).sort()
  expected = expected.map(option => option.toLowerCase()).sort()
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
  const accetedProposals: ProposalAttributes[] = []
  const rejectedProposals: ProposalAttributes[] = []

  for (const proposal of pendingProposals) {
    const choices = proposal.configuration.choices
    const isYesNo = sameOptions(choices, ['yes', 'no'])
    const isAcceptReject = sameOptions(choices, ['accept', 'reject'])
    if (isYesNo || isAcceptReject) {
      const scores = await VotesModel.getVotes(proposal.id)
      const votes: Record<string, Vote> = scores?.votes || {}
      const voters = Object.keys(votes)

      if (voters.length === 0) {
        finishedProposals.push(proposal)
      } else {
        const result: Record<string, number> = {}
        for (const voter of voters) {
          const vote = votes[voter]
          const choice = vote.choice - 1
          result[choice] = (result[choice] || 0) + vote.vp
        }

        if (
          isYesNo && result['yes'] > result['no'] ||
          isAcceptReject && result['accept'] > result['reject']
        ) {
          accetedProposals.push(proposal)
        } else {
          rejectedProposals.push(proposal)
        }
      }
    } else {
      finishedProposals.push(proposal)
    }
  }

  if (finishedProposals.length > 0) {
    context.log(`Finishing ${finishedProposals.length} proposals...`)
    await ProposalModel.finishProposal(finishedProposals.map(proposal => proposal.id), ProposalStatus.Finished)
  }

  if (accetedProposals.length > 0) {
    context.log(`Accepting ${accetedProposals.length} proposals...`)
    await ProposalModel.finishProposal(accetedProposals.map(proposal => proposal.id), ProposalStatus.Passed)
  }

  if (rejectedProposals.length > 0) {
    context.log(`Rejecting ${rejectedProposals.length} proposals...`)
    await ProposalModel.finishProposal(rejectedProposals.map(proposal => proposal.id), ProposalStatus.Rejected)
  }
}