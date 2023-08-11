import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'

import { BadgesService } from '../../services/BadgesService'
import BidService from '../../services/BidService'
import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { ErrorService } from '../../services/ErrorService'
import { ProposalService } from '../../services/ProposalService'
import { ErrorCategory } from '../../utils/errorCategories'
import { Budget } from '../Budget/types'

import ProposalModel from './model'
import { ProposalOutcome, ProposalWithOutcome, calculateOutcome, getWinnerBiddingAndTenderingProposal } from './outcome'
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

    await BadgesService.giveLegislatorBadges(acceptedProposals)
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

export async function getFinishabledLinkedProposals(
  pendingProposals: ProposalAttributes[],
  type: ProposalType.Bid | ProposalType.Tender
) {
  let proposals = pendingProposals.filter((item) => item.type === type)
  if (proposals.length > 0) {
    const linkedProposalIds = [...new Set(proposals.map((item) => item.configuration.linked_proposal_id))]
    proposals = []
    for (const id of linkedProposalIds) {
      const tenderProposals = await ProposalModel.getProposalList({ type, linkedProposalId: id })
      proposals = [...proposals, ...tenderProposals]
    }
  }

  return proposals
}

function hasCustomOutcome(type: ProposalType) {
  return type === ProposalType.Grant || type === ProposalType.Tender || type === ProposalType.Bid
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
  const finishableTenderProposals = await getFinishabledLinkedProposals(pendingProposals, ProposalType.Tender)
  const finishableBidProposals = await getFinishabledLinkedProposals(pendingProposals, ProposalType.Bid)
  const pendingProposalsWithOutcome = await getProposalsWithOutcome(
    [
      ...pendingProposals.filter((item) => item.type !== ProposalType.Tender && item.type !== ProposalType.Bid),
      ...finishableTenderProposals,
      ...finishableBidProposals,
    ],
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
        if (!hasCustomOutcome(proposal.type)) {
          acceptedProposals.push(proposal)
        } else if (proposal.type === ProposalType.Tender || proposal.type === ProposalType.Bid) {
          const winnerProposal = getWinnerBiddingAndTenderingProposal(
            pendingProposalsWithOutcome,
            proposal.configuration.linked_proposal_id,
            proposal.type
          )
          if (winnerProposal?.id === proposal.id) {
            acceptedProposals.push(proposal)
          } else {
            rejectedProposals.push(proposal)
          }
        } else {
          const budgetForProposal = getBudgetForProposal(updatedBudgets, proposal)
          if (!budgetForProposal) {
            ErrorService.report(`Unable to find quarter budget`, {
              proposalId: proposal.id,
              category: ErrorCategory.Job,
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
  const finishableProposals = await ProposalModel.getFinishableProposals()
  if (finishableProposals.length === 0) {
    return
  }

  const currentBudgets = await BudgetService.getBudgetsForProposals(finishableProposals)

  context.log(`Updating ${finishableProposals.length} proposals...`)
  const { finishedProposals, acceptedProposals, outOfBudgetProposals, rejectedProposals, updatedBudgets } =
    await categorizeProposals(finishableProposals, currentBudgets, context)

  await updateFinishedProposals(finishedProposals, context)
  await updateAcceptedProposals(acceptedProposals, context)
  await updateOutOfBudgetProposals(outOfBudgetProposals, context)
  await updateRejectedProposals(rejectedProposals, context)
  await BudgetService.updateBudgets(updatedBudgets)

  const proposals = [...finishedProposals, ...acceptedProposals, ...rejectedProposals]
  context.log(`Updating ${proposals.length} proposals in discourse... \n\n`)
  for (const { id, title, winnerChoice, outcomeStatus } of proposals) {
    ProposalService.commentProposalUpdateInDiscourse(id)
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

export async function publishBids(context: JobContext) {
  try {
    await BidService.publishBids(context)
  } catch (error) {
    ErrorService.report('Error publishing bids', { error, category: ErrorCategory.Job })
  }
}
