import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'

import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { CurrentBudget } from '../Budget/types'
import UpdateModel from '../Updates/model'

import { Outcome, ProposalOutcome, calculateOutcome } from './calculateOutcome'
import ProposalModel from './model'
import { commentProposalUpdateInDiscourse } from './routes'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { asNumber } from './utils'

type ProposalWithOutcome = ProposalAttributes & Outcome

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  context.log(activatedProposals === 0 ? `No activated proposals` : `Activated ${activatedProposals} proposals...`)
}

async function updateRejectedProposals(rejectedProposals: ProposalWithOutcome[], context: JobContext) {
  if (rejectedProposals.length > 0) {
    context.log(`Rejecting ${rejectedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      rejectedProposals.map(({ id }) => id),
      ProposalStatus.Rejected
    )
  }
}

async function updateAcceptedProposals(acceptedProposals: ProposalWithOutcome[], context: JobContext) {
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
}

async function updateOutOfBudgetProposals(outOfBudgetProposals: ProposalWithOutcome[], context: JobContext) {
  if (outOfBudgetProposals.length > 0) {
    context.log(`Updating ${outOfBudgetProposals.length} Out of Budget proposals...`)
    await ProposalModel.finishProposal(
      outOfBudgetProposals.map(({ id }) => id),
      ProposalStatus.OutOfBudget
    )
  }
}

async function updateFinishedProposals(finishedProposals: ProposalWithOutcome[], context: JobContext) {
  if (finishedProposals.length > 0) {
    context.log(`Finishing ${finishedProposals.length} proposals...`)
    await ProposalModel.finishProposal(
      finishedProposals.map(({ id }) => id),
      ProposalStatus.Finished
    )
  }
}

async function categorizeProposals(
  pendingProposals: ProposalAttributes[],
  currentBudgets: CurrentBudget[],
  context: JobContext
) {
  const finishedProposals: ProposalWithOutcome[] = []
  const acceptedProposals: ProposalWithOutcome[] = []
  const outOfBudgetProposals: ProposalWithOutcome[] = []
  const rejectedProposals: ProposalWithOutcome[] = []

  for (const proposal of pendingProposals) {
    const outcome = await calculateOutcome(proposal, context)
    if (!outcome) {
      context.error(`Unable to calculate outcome for ${proposal.id}`)
      continue
    }

    const proposalWithWinnerChoice = { ...proposal, ...outcome }
    switch (outcome.outcomeStatus) {
      case ProposalOutcome.REJECTED:
        rejectedProposals.push(proposalWithWinnerChoice)
        break
      case ProposalOutcome.ACCEPTED:
        if (proposalWithWinnerChoice.type !== ProposalType.Grant) {
          acceptedProposals.push(proposalWithWinnerChoice)
          break
        } else {
          const proposalBudget = currentBudgets.find(
            (budget) =>
              budget.start_at <= proposalWithWinnerChoice.start_at &&
              budget.finish_at > proposalWithWinnerChoice.start_at
          )
          if (!proposalBudget) {
            context.error(`Unable to find corresponding quarter budget for ${proposal.id}`)
            break
          }
          const categoryBudget = proposalBudget.categories[snakeCase(proposalWithWinnerChoice.configuration.category)]
          const size = asNumber(proposalWithWinnerChoice.configuration.size)
          if (categoryBudget.allocated + size <= categoryBudget.total) {
            proposalBudget.categories[snakeCase(proposalWithWinnerChoice.configuration.category)].allocated =
              categoryBudget.allocated + size
            proposalBudget.categories[snakeCase(proposalWithWinnerChoice.configuration.category)].available =
              categoryBudget.available - size
            proposalBudget.allocated = proposalBudget.allocated + size
            acceptedProposals.push(proposalWithWinnerChoice)
          } else {
            outOfBudgetProposals.push(proposalWithWinnerChoice)
          }
        }
        break
      case ProposalOutcome.FINISHED:
        finishedProposals.push(proposalWithWinnerChoice)
    }
  }
  return {
    finishedProposals,
    acceptedProposals,
    outOfBudgetProposals,
    rejectedProposals,
    updatedBudgets: currentBudgets,
  }
}

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposals()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  const currentBudgets = await BudgetService.getBudgets(pendingProposals)

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const { finishedProposals, acceptedProposals, outOfBudgetProposals, rejectedProposals, updatedBudgets } =
    await categorizeProposals(pendingProposals, currentBudgets, context)

  await updateFinishedProposals(finishedProposals, context)
  await updateAcceptedProposals(acceptedProposals, context)
  await updateOutOfBudgetProposals(outOfBudgetProposals, context)
  await updateRejectedProposals(rejectedProposals, context)
  await BudgetService.updateBudgets(updatedBudgets)

  const proposals: ProposalWithOutcome[] = [...finishedProposals, ...acceptedProposals, ...rejectedProposals]
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
