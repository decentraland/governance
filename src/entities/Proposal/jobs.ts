import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'

import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { ErrorService } from '../../services/ErrorService'
import { Budget } from '../Budget/types'
import { BUDGETING_START_DATE } from '../Grant/constants'
import UpdateModel from '../Updates/model'

import ProposalModel from './model'
import { ProposalOutcome, calculateOutcome } from './outcome'
import { commentProposalUpdateInDiscourse } from './routes'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { asNumber } from './utils'

type Outcome = {
  winnerChoice: string
  outcomeStatus?: ProposalOutcome
}

type ProposalWithOutcome = ProposalAttributes & Outcome

// TODO: Delete this and all proposal pending status
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

function getBudgetForProposal(currentBudgets: Budget[], proposal: ProposalWithOutcome) {
  return currentBudgets.find((budget) => budget.start_at <= proposal.start_at && budget.finish_at > proposal.start_at)
}

function getCategoryBudget(proposal: ProposalWithOutcome, proposalBudget: Budget) {
  const categoryName = snakeCase(proposal.configuration.category)
  return proposalBudget.categories[categoryName]
}

function grantCanBeFunded(proposal: ProposalWithOutcome, proposalBudget: Budget) {
  const categoryBudget = getCategoryBudget(proposal, proposalBudget)
  const size = asNumber(proposal.configuration.size)
  return categoryBudget.allocated + size <= categoryBudget.total
}

function updateCategoryBudget(proposal: ProposalWithOutcome, budgetForProposal: Budget) {
  const categoryBudget = getCategoryBudget(proposal, budgetForProposal)
  const size = asNumber(proposal.configuration.size)
  categoryBudget.allocated += size
  categoryBudget.available -= size
  budgetForProposal.allocated += size
}

async function categorizeProposals(
  pendingProposals: ProposalAttributes[],
  currentBudgets: Budget[],
  context: JobContext
) {
  const finishedProposals: ProposalWithOutcome[] = []
  const acceptedProposals: ProposalWithOutcome[] = []
  const outOfBudgetProposals: ProposalWithOutcome[] = []
  const rejectedProposals: ProposalWithOutcome[] = []
  const updatedBudgets = [...currentBudgets]

  for (const proposal of pendingProposals) {
    const outcome = await calculateOutcome(proposal, context)
    if (!outcome) {
      continue
    }

    const proposalWithOutcome = { ...proposal, ...outcome }
    switch (outcome.outcomeStatus) {
      case ProposalOutcome.REJECTED:
        rejectedProposals.push(proposalWithOutcome)
        break
      case ProposalOutcome.FINISHED:
        finishedProposals.push(proposalWithOutcome)
        break
      case ProposalOutcome.ACCEPTED:
        if (proposalWithOutcome.type !== ProposalType.Grant || proposalWithOutcome.start_at < BUDGETING_START_DATE) {
          acceptedProposals.push(proposalWithOutcome)
        } else {
          const budgetForProposal = getBudgetForProposal(updatedBudgets, proposalWithOutcome)
          if (!budgetForProposal) {
            ErrorService.report(`Unable to find corresponding quarter budget for ${proposal.id}`)
            break
          }
          if (grantCanBeFunded(proposalWithOutcome, budgetForProposal)) {
            updateCategoryBudget(proposalWithOutcome, budgetForProposal)
            acceptedProposals.push(proposalWithOutcome)
          } else {
            outOfBudgetProposals.push(proposalWithOutcome)
          }
        }
    }
  }

  return {
    finishedProposals,
    acceptedProposals,
    outOfBudgetProposals,
    rejectedProposals,
    updatedBudgets,
  }
}

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposals()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  const currentBudgets = await BudgetService.getBudgetsForProposals(pendingProposals)

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const { finishedProposals, acceptedProposals, outOfBudgetProposals, rejectedProposals, updatedBudgets } =
    await categorizeProposals(pendingProposals, currentBudgets, context)

  await updateFinishedProposals(finishedProposals, context)
  await updateAcceptedProposals(acceptedProposals, context)
  await updateOutOfBudgetProposals(outOfBudgetProposals, context)
  await updateRejectedProposals(rejectedProposals, context)
  await BudgetService.updateBudgets(updatedBudgets)

  const proposals = [...finishedProposals, ...acceptedProposals, ...rejectedProposals]
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
