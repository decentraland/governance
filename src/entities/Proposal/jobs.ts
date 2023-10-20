import { SQLStatement } from 'decentraland-gatsby/dist/entities/Database/utils'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'
import { Pool } from 'pg'

import { NotificationService } from '../../back/services/notification'
import { BadgesService } from '../../services/BadgesService'
import BidService from '../../services/BidService'
import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import { Budget } from '../Budget/types'

import ProposalModel from './model'
import {
  ProposalVotingResult,
  ProposalWithOutcome,
  VotingOutcome,
  calculateVotingResult,
  getWinnerBiddingAndTenderingProposal,
} from './outcome'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'
import { asNumber } from './utils'

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  if (activatedProposals > 0) {
    context.log(`Activated ${activatedProposals} proposals...`)
  }
}

function getBudgetForProposal(currentBudgets: Budget[], proposal: ProposalAttributes) {
  return currentBudgets.find((budget) => budget.start_at <= proposal.start_at && budget.finish_at > proposal.start_at)
}

function getCategoryBudget(proposal: ProposalAttributes, proposalBudget: Budget) {
  const categoryName = snakeCase(proposal.configuration.category)
  return proposalBudget.categories[categoryName]
}

function grantCanBeFunded(proposal: ProposalAttributes, proposalBudget: Budget) {
  const categoryBudget = getCategoryBudget(proposal, proposalBudget)
  const size = asNumber(proposal.configuration.size)
  return categoryBudget.allocated + size <= categoryBudget.total
}

function updateCategoryBudget(proposal: ProposalAttributes, budgetForProposal: Budget) {
  const categoryBudget = getCategoryBudget(proposal, budgetForProposal)
  const size = asNumber(proposal.configuration.size)
  categoryBudget.allocated += size
  categoryBudget.available -= size
  budgetForProposal.allocated += size
}

async function getProposalsVotingResult(proposals: ProposalAttributes[]) {
  const pendingProposalsVotingResult: ProposalVotingResult[] = []
  for (const proposal of proposals) {
    const outcome = await calculateVotingResult(proposal)
    if (!outcome) {
      continue
    }
    pendingProposalsVotingResult.push({ ...proposal, ...outcome })
  }
  return pendingProposalsVotingResult
}

export async function getFinishableLinkedProposals(
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
  currentBudgets: Budget[]
): Promise<{ proposalsWithOutcome: ProposalWithOutcome[]; budgetsWithUpdates: Budget[] }> {
  const proposalsWithOutcome: ProposalWithOutcome[] = []
  const budgetsWithUpdates = [...currentBudgets]
  const finishableTenderProposals = await getFinishableLinkedProposals(pendingProposals, ProposalType.Tender)
  const finishableBidProposals = await getFinishableLinkedProposals(pendingProposals, ProposalType.Bid)
  const proposalsWithVotingResult = await getProposalsVotingResult([
    ...pendingProposals.filter((item) => item.type !== ProposalType.Tender && item.type !== ProposalType.Bid),
    ...finishableTenderProposals,
    ...finishableBidProposals,
  ])

  for (const proposal of proposalsWithVotingResult) {
    switch (proposal.votingOutcome) {
      case VotingOutcome.REJECTED:
        proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Rejected })
        break
      case VotingOutcome.FINISHED:
        proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Finished })
        break
      case VotingOutcome.ACCEPTED:
        if (!hasCustomOutcome(proposal.type)) {
          proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Passed })
        } else if (proposal.type === ProposalType.Tender || proposal.type === ProposalType.Bid) {
          const winnerProposal = getWinnerBiddingAndTenderingProposal(
            proposalsWithVotingResult,
            proposal.configuration.linked_proposal_id,
            proposal.type
          )
          if (winnerProposal?.id === proposal.id) {
            proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Passed })
          } else {
            proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Rejected })
          }
        } else {
          const budgetForProposal = getBudgetForProposal(budgetsWithUpdates, proposal)
          if (!budgetForProposal) {
            ErrorService.report(`Unable to find quarter budget`, {
              proposalId: proposal.id,
              category: ErrorCategory.Job,
            })
            break
          }
          if (grantCanBeFunded(proposal, budgetForProposal)) {
            updateCategoryBudget(proposal, budgetForProposal)
            proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.Passed })
          } else {
            proposalsWithOutcome.push({ ...proposal, newStatus: ProposalStatus.OutOfBudget })
          }
        }
    }
  }

  return {
    proposalsWithOutcome,
    budgetsWithUpdates: budgetsWithUpdates,
  }
}

export async function finishProposal() {
  try {
    const finishableProposals = await ProposalModel.getFinishableProposals()
    if (finishableProposals.length === 0) {
      return
    }
    logger.log(`Updating ${finishableProposals.length} proposals...`)

    const currentBudgets = await BudgetService.getBudgetsForProposals(finishableProposals)

    const { proposalsWithOutcome, budgetsWithUpdates } = await categorizeProposals(finishableProposals, currentBudgets)

    await updateProposalsAndBudgets(proposalsWithOutcome, budgetsWithUpdates)

    NotificationService.sendFinishProposalNotifications(proposalsWithOutcome)
    BadgesService.giveFinishProposalBadges(proposalsWithOutcome)
    DiscourseService.commentFinishedProposals(proposalsWithOutcome)
    DiscordService.notifyFinishedProposals(proposalsWithOutcome)
  } catch (error) {
    ErrorService.report('Error finishing proposals', { error, category: ErrorCategory.Job })
  }
}

export async function publishBids(context: JobContext) {
  try {
    await BidService.publishBids(context)
  } catch (error) {
    ErrorService.report('Error publishing bids', { error, category: ErrorCategory.Job })
  }
}

async function updateProposalsAndBudgets(proposalsWithOutcome: ProposalWithOutcome[], budgetsWithUpdates: Budget[]) {
  const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING || '',
  })

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (proposalsWithOutcome.length === 0) return

    const proposalUpdateQueriesByStatus: SQLStatement[] = []
    Object.values(ProposalStatus).forEach((proposalStatus) => {
      const proposalsToUpdate = proposalsWithOutcome.filter((proposal) => proposal.newStatus === proposalStatus)
      if (proposalsToUpdate.length > 0) {
        const query = ProposalModel.getFinishProposalQuery(
          proposalsToUpdate.map(({ id }) => id),
          proposalStatus
        )

        if (query !== null) {
          proposalUpdateQueriesByStatus.push(query)
        }
      }
    })

    const budgetUpdateQueries = BudgetService.getBudgetUpdateQueries(budgetsWithUpdates)

    const updateQueries = [...proposalUpdateQueriesByStatus, ...budgetUpdateQueries]

    const clientQueries = updateQueries.map(({ text, values }) => {
      console.log('text', text)
      console.log('values', values)
      return client.query(text, values)
    })

    await Promise.all(clientQueries)

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
