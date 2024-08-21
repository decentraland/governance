import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import snakeCase from 'lodash/snakeCase'
import { Pool } from 'pg'

import { BadgesService } from '../../services/BadgesService'
import BidService from '../../services/BidService'
import { BudgetService } from '../../services/BudgetService'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { ProjectService } from '../../services/ProjectService'
import { ProposalService } from '../../services/ProposalService'
import { VestingService } from '../../services/VestingService'
import { DiscordService } from '../../services/discord'
import { EventsService } from '../../services/events'
import { NotificationService } from '../../services/notification'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'
import logger from '../../utils/logger'
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
  const proposalsWithVotingResult: ProposalVotingResult[] = []
  for (const proposal of proposals) {
    const votingResult = await calculateVotingResult(proposal)
    if (!votingResult) {
      continue
    }
    proposalsWithVotingResult.push({ ...proposal, ...votingResult })
  }
  return proposalsWithVotingResult
}

export async function getFinishableLinkedProposals(
  pendingProposals: ProposalAttributes[],
  type: ProposalType.Tender | ProposalType.Bid
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

function reportPendingProposalsWithoutVotingResults(
  pendingProposals: ProposalAttributes[],
  proposalsWithVotingResult: ProposalVotingResult[]
) {
  if (isProdEnv()) {
    pendingProposals.map((pendingProposal) => {
      if (
        !proposalsWithVotingResult.some(
          (proposalsWithVotingResult) => proposalsWithVotingResult.id === pendingProposal.id
        )
      ) {
        ErrorService.report('Could not find voting results for pending proposal', {
          proposal: pendingProposal,
          category: ErrorCategory.Job,
        })
      }
    })
  }
}

async function prepareProposalsAndBudgetsUpdates(
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

  reportPendingProposalsWithoutVotingResults(pendingProposals, proposalsWithVotingResult)

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

function logFinishableProposals(finishableProposals: ProposalAttributes[]) {
  if (isProdEnv()) {
    logger.log(`Finishable proposals:`)
    finishableProposals.forEach((proposal, index) => {
      console.log(`${index}: ${proposal.id} - ${proposal.title}`)
    })
  }
}

export async function finishProposal() {
  if (isProdEnv()) {
    logger.log(`Running finish proposal job...`)
  }

  try {
    const finishableProposals = await ProposalModel.getFinishableProposals()
    logFinishableProposals(finishableProposals)
    if (finishableProposals.length === 0) {
      return
    }
    logger.log(`Updating ${finishableProposals.length} proposals...`)

    const currentBudgets = await BudgetService.getBudgetsForProposals(finishableProposals)

    const { proposalsWithOutcome, budgetsWithUpdates } = await prepareProposalsAndBudgetsUpdates(
      finishableProposals,
      currentBudgets
    )

    await updateProposalsAndBudgets(proposalsWithOutcome, budgetsWithUpdates)

    await ProjectService.createProjects(proposalsWithOutcome)
    NotificationService.sendFinishProposalNotifications(proposalsWithOutcome)
    BadgesService.giveFinishProposalBadges(proposalsWithOutcome)
    DiscourseService.commentFinishedProposals(proposalsWithOutcome)
    DiscordService.notifyFinishedProposals(proposalsWithOutcome)
    await EventsService.proposalFinished(proposalsWithOutcome)
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

const pool = new Pool({ connectionString: process.env.CONNECTION_STRING })

async function updateProposalsAndBudgets(proposalsWithOutcome: ProposalWithOutcome[], budgetsWithUpdates: Budget[]) {
  if (proposalsWithOutcome.length === 0) return
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const proposalUpdateQueriesByStatus = ProposalService.getFinishProposalQueries(proposalsWithOutcome)
    const budgetUpdateQueries = BudgetService.getBudgetUpdateQueries(budgetsWithUpdates)
    const updateQueries = [...proposalUpdateQueriesByStatus, ...budgetUpdateQueries]

    const clientQueries = updateQueries.map(({ text, values }) => {
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

export async function notifyCliffEndingSoon() {
  const vestings = await VestingService.getVestingsWithRecentlyEndedCliffs()
  const vestingAddresses = vestings.map((vesting) => vesting.address)
  const proposalContributors = await ProposalService.findContributorsForProposalsByVestings(vestingAddresses)
  await NotificationService.cliffEnded(proposalContributors)
}
