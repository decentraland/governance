import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'

import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import { Budget } from '../Budget/types'

import ProposalModel from './model'
import { ProposalOutcome, ProposalWithOutcome, calculateOutcome, getWinnerTender } from './outcome'
import { commentProposalUpdateInDiscourse } from './routes'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { asNumber } from './utils'

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  if (activatedProposals > 0) {
    context.log(`Activated ${activatedProposals} proposals...`)
  }
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

async function getProposalsWithOutcome(proposals: ProposalAttributes[], context: JobContext) {
  const pendingProposalsWithOutcome = []

  for (const proposal of proposals) {
    const outcome = await calculateOutcome(proposal, context)
    if (!outcome) {
      continue
    }

    pendingProposalsWithOutcome.push({ ...proposal, ...outcome })
  }

  return pendingProposalsWithOutcome
}

export async function getFinishableTenderProposals(pendingProposals: ProposalAttributes[]) {
  let pendingTenderProposals = pendingProposals.filter((item) => item.type === ProposalType.Tender)
  if (pendingTenderProposals.length > 0) {
    const linkedProposalIds = [...new Set(pendingTenderProposals.map((item) => item.configuration.linked_proposal_id))]
    pendingTenderProposals = []
    for (const id of linkedProposalIds) {
      const tenderProposals = await ProposalModel.getProposalList({ type: ProposalType.Tender, linkedProposalId: id })
      pendingTenderProposals = [...pendingTenderProposals, ...tenderProposals]
    }
  }

  return pendingTenderProposals
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
  const finishableTenderProposals = await getFinishableTenderProposals(pendingProposals)
  const pendingProposalsWithOutcome = await getProposalsWithOutcome(
    [...pendingProposals.filter((item) => item.type !== ProposalType.Tender), ...finishableTenderProposals],
    context
  )

  for (const proposal of pendingProposalsWithOutcome) {
    switch (proposal.outcomeStatus) {
      case ProposalOutcome.REJECTED:
        rejectedProposals.push(proposal)
        break
      case ProposalOutcome.FINISHED:
        finishedProposals.push(proposal)
        break
      case ProposalOutcome.ACCEPTED:
        if (proposal.type !== ProposalType.Grant && proposal.type !== ProposalType.Tender) {
          acceptedProposals.push(proposal)
        } else if (proposal.type === ProposalType.Tender) {
          const winnerTenderProposal = getWinnerTender(
            pendingProposalsWithOutcome,
            proposal.configuration.linked_proposal_id
          )
          if (winnerTenderProposal?.id === proposal.id) {
            acceptedProposals.push(proposal)
          } else {
            rejectedProposals.push(proposal)
          }
        } else {
          const budgetForProposal = getBudgetForProposal(updatedBudgets, proposal)
          if (!budgetForProposal) {
            ErrorService.report(`Unable to find quarter budget`, {
              proposalId: proposal.id,
              category: ErrorCategory.JobError,
            })
            break
          }
          if (grantCanBeFunded(proposal, budgetForProposal)) {
            updateCategoryBudget(proposal, budgetForProposal)
            acceptedProposals.push(proposal)
          } else {
            outOfBudgetProposals.push(proposal)
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
  const pendingProposals = await ProposalModel.getFinishableProposals()
  if (pendingProposals.length === 0) {
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
