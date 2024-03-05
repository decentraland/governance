import { DCL_NOTIFICATIONS_SERVICE_ENABLED } from '../../constants'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import { inBackground } from '../../helpers'
import { ErrorService } from '../../services/ErrorService'
import { ProposalCommentedEvent } from '../../shared/types/events'
import { DclNotification } from '../../shared/types/notifications'
import { ErrorCategory } from '../../utils/errorCategories'
import logger from '../../utils/logger'
import { Notifications } from '../../utils/notifications'
import { areValidAddresses } from '../utils/validations'

import { CoauthorService } from './coauthor'
import { VoteService } from './vote'

const DCL_NOTIFICATIONS_SERVICE_API_URL = process.env.DCL_NOTIFICATIONS_SERVICE_API_URL
const DCL_NOTIFICATIONS_SERVICE_API_TOKEN = process.env.DCL_NOTIFICATIONS_SERVICE_API_TOKEN

export class DclNotificationService {
  static async sendNotification(notifications: DclNotification[]) {
    if (!DCL_NOTIFICATIONS_SERVICE_ENABLED) {
      return
    }

    await fetch(`${DCL_NOTIFICATIONS_SERVICE_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DCL_NOTIFICATIONS_SERVICE_API_TOKEN}`,
      },
      body: JSON.stringify(notifications),
    })
  }

  static projectProposalEnacted(proposal: ProposalAttributes) {
    inBackground(async () => {
      try {
        const coauthors = await CoauthorService.getAllFromProposalId(proposal.id)
        const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address) : []
        const addresses = [proposal.user, ...coauthorsAddresses]

        if (!areValidAddresses(addresses)) {
          throw new Error('Invalid addresses')
        }

        const notifications = addresses.map((address) => ({
          type: 'governance_proposal_enacted',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            title: Notifications.ProjectEnacted.title,
            description: Notifications.ProjectEnacted.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        return await this.sendNotification(notifications)
      } catch (error) {
        ErrorService.report('Error sending proposal enacted notification', {
          error,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static async coAuthorRequested(proposal: ProposalAttributes, coAuthors: string[]) {
    try {
      if (!areValidAddresses(coAuthors)) {
        throw new Error('Invalid addresses')
      }

      const notifications = coAuthors.map((address) => ({
        type: 'governance_coauthor_requested',
        address,
        eventKey: proposal.id,
        metadata: {
          proposalId: proposal.id,
          title: Notifications.CoAuthorRequestReceived.title,
          description: Notifications.CoAuthorRequestReceived.body,
          link: proposalUrl(proposal.id),
        },
        timestamp: Date.now(),
      }))

      return await this.sendNotification(notifications)
    } catch (error) {
      ErrorService.report('Error sending co-author request notification', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static async #authoredProposalFinished(proposal: ProposalAttributes) {
    try {
      const coauthors = await CoauthorService.getAllFromProposalId(proposal.id)
      const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address) : []
      const addresses = [proposal.user, ...coauthorsAddresses]

      if (!areValidAddresses(addresses)) {
        throw new Error('Invalid addresses')
      }

      const notifications = addresses.map((address) => ({
        type: 'governance_authored_proposal_finished',
        address,
        eventKey: proposal.id,
        metadata: {
          proposalId: proposal.id,
          title: Notifications.ProposalAuthoredFinished.title(proposal),
          description: Notifications.ProposalAuthoredFinished.body,
          link: proposalUrl(proposal.id),
        },
        timestamp: Date.now(),
      }))

      return await this.sendNotification(notifications)
    } catch (error) {
      ErrorService.report('Error sending voting ended notification to authors', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static async #votingEndedVoters(proposal: ProposalAttributes, addresses: string[]) {
    try {
      if (!areValidAddresses(addresses)) {
        throw new Error('Invalid addresses')
      }

      const notifications = addresses.map((address) => ({
        type: 'governance_voting_ended_voter',
        address,
        eventKey: proposal.id,
        metadata: {
          proposalId: proposal.id,
          title: Notifications.ProposalVotedFinished.title(proposal),
          description: Notifications.ProposalVotedFinished.body,
          link: proposalUrl(proposal.id),
        },
        timestamp: Date.now(),
      }))

      return await this.sendNotification(notifications)
    } catch (error) {
      ErrorService.report('Error sending voting ended notification to voters', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static sendFinishProposalNotifications(proposals: ProposalAttributes[]) {
    if (DCL_NOTIFICATIONS_SERVICE_ENABLED) {
      inBackground(async () => {
        for (const proposal of proposals) {
          try {
            await this.#authoredProposalFinished(proposal)
            const votes = await VoteService.getVotes(proposal.id)
            const voters = Object.keys(votes)
            await this.#votingEndedVoters(proposal, voters)
          } catch (error) {
            logger.log('Error sending notifications on proposal finish', { proposalId: proposal.id })
          }
        }
      })
    }
  }

  static newCommentOnProposal(commentEvent: ProposalCommentedEvent) {
    inBackground(async () => {
      const proposalId = commentEvent.event_data.proposal_id
      try {
        const proposal = await ProposalModel.getProposal(proposalId)
        const coauthors = await CoauthorService.getAllFromProposalId(proposalId)
        const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address) : []
        const addresses = [proposal.user, ...coauthorsAddresses]

        const notifications = addresses.map((address) => ({
          type: 'governance_new_comment_on_proposal',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            title: Notifications.ProposalCommented.title(proposal),
            description: Notifications.ProposalCommented.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        return await this.sendNotification(notifications)
      } catch (error) {
        ErrorService.report('Error sending notifications for new comment on proposal', {
          error,
          category: ErrorCategory.Notifications,
          proposal_id: proposalId,
          event: commentEvent,
        })
      }
    })
  }
}
