import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { DiscordService } from '../../services/DiscordService'
import UpdateModel from '../Updates/model'

import { Outcome, ProposalOutcome, calculateOutcome } from './calculateOutcome'
import ProposalModel from './model'
import { commentProposalUpdateInDiscourse } from './routes'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

type ProposalWithWinnerChoice = ProposalAttributes & Outcome

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  context.log(activatedProposals === 0 ? `No activated proposals` : `Activated ${activatedProposals} proposals...`)
}

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposals()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const finishedProposals: ProposalWithWinnerChoice[] = []
  const acceptedProposals: ProposalWithWinnerChoice[] = []
  const rejectedProposals: ProposalWithWinnerChoice[] = []

  for (const proposal of pendingProposals) {
    const outcome = await calculateOutcome(proposal, context)
    if (!outcome) {
      console.error(`Unable to calculate outcome for ${proposal.id}`)
      continue
    }

    const proposalWithWinnerChoice = { ...proposal, ...outcome }
    switch (outcome.outcomeStatus) {
      case ProposalOutcome.REJECTED:
        rejectedProposals.push(proposalWithWinnerChoice)
        break
      case ProposalOutcome.ACCEPTED:
        acceptedProposals.push(proposalWithWinnerChoice)
        break
      case ProposalOutcome.FINISHED:
        finishedProposals.push(proposalWithWinnerChoice)
    }
  }

  if (finishedProposals.length > 0) {
    context.log(`Finishing ${finishedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      finishedProposals.map(({ id }) => id),
      ProposalStatus.Finished
    )
  }

  if (acceptedProposals.length > 0) {
    context.log(`Accepting ${acceptedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      acceptedProposals.map(({ id }) => id),
      ProposalStatus.Passed
    )

    await Promise.all(
      acceptedProposals.map(async ({ id, type, configuration }) => {
        if (type == ProposalType.Grant) {
          await UpdateModel.createPendingUpdates(id, configuration.projectDuration)
        }
      })
    )
  }

  if (rejectedProposals.length > 0) {
    context.log(`Rejecting ${rejectedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      rejectedProposals.map(({ id }) => id),
      ProposalStatus.Rejected
    )
  }

  const proposals: ProposalWithWinnerChoice[] = [...finishedProposals, ...acceptedProposals, ...rejectedProposals]
  context.log(`Updating ${proposals.length} proposals in discourse... \n\n`)
  for (const { id, title, winnerChoice, outcomeStatus } of proposals) {
    commentProposalUpdateInDiscourse(id)
    if (outcomeStatus) {
      DiscordService.finishProposal(
        id,
        title,
        outcomeStatus,
        outcomeStatus === ProposalOutcome.FINISHED ? winnerChoice : undefined
      )
    }
  }
}
