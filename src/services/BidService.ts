import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import BidModel from '../entities/Bid/model'
import { BidStatus, UnpublishedBid } from '../entities/Bid/types'
import { GATSBY_GRANT_VP_THRESHOLD } from '../entities/Grant/constants'
import ProposalModel from '../entities/Proposal/model'
import { ProposalType } from '../entities/Proposal/types'
import { DEFAULT_CHOICES } from '../entities/Proposal/utils'
import Time from '../utils/date/Time'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import { getHighBudgetVpThreshold } from '../utils/projects'

import { ErrorService } from './ErrorService'
import { ProposalService } from './ProposalService'

const MINIMUM_BIDS_TO_PUBLISH = Number(process.env.MINIMUM_BIDS_TO_PUBLISH || 0)
export default class BidService {
  static async createBid(
    linked_proposal_id: string,
    author_address: string,
    bid_proposal_data: UnpublishedBid['bid_proposal_data']
  ) {
    const bidsSubmissionWindow = process.env.SUBMISSION_WINDOW_DURATION_BID
      ? Number(process.env.SUBMISSION_WINDOW_DURATION_BID)
      : undefined

    if (!bidsSubmissionWindow) {
      throw new Error('Bids submission window is not defined')
    }
    if (await this.isSubmissionWindowFinished(linked_proposal_id)) {
      throw new Error('Bids submission window is finished')
    }
    const tenderBids = await BidModel.getBidsInfoByTender(linked_proposal_id)

    if (tenderBids.find((bid) => bid.author_address === author_address)) {
      throw new Error('Bid already exists')
    }

    const publish_at =
      tenderBids.length > 0 ? tenderBids[0].publish_at : Time.utc().add(bidsSubmissionWindow, 'seconds').toISOString()
    await BidModel.createBid({
      linked_proposal_id,
      bid_proposal_data,
      author_address,
      publish_at,
      status: BidStatus.Pending,
    })
  }

  static async publishBids(context: JobContext) {
    const pendingBids = await BidModel.getBidsReadyToPublish()
    if (pendingBids.length === 0) {
      return
    }

    if (MINIMUM_BIDS_TO_PUBLISH === 0) {
      const errorMsg = `Minimum bids to publish is not set. Please set MINIMUM_BIDS_TO_PUBLISH env variable`
      ErrorService.report(errorMsg, { category: ErrorCategory.Bid })
      context.log(errorMsg)
      return
    }

    const bidsByTender = new Map<string, typeof pendingBids>()
    pendingBids.reduce((acc, bid) => {
      const bids = acc.get(bid.linked_proposal_id) || []
      bids.push(bid)
      acc.set(bid.linked_proposal_id, bids)
      return acc
    }, bidsByTender)

    const tendersWithBidsToReject = []

    for (const [tenderId, bids] of bidsByTender) {
      if (bids.length < MINIMUM_BIDS_TO_PUBLISH) {
        tendersWithBidsToReject.push(tenderId)
        continue
      }

      for (const bid of bids) {
        const { author_address, bid_proposal_data, linked_proposal_id, publish_at, id } = bid
        const finish_at = Time.utc(publish_at).add(Number(process.env.DURATION_BID), 'seconds').toDate()
        try {
          const required_to_pass =
            !isProdEnv() && GATSBY_GRANT_VP_THRESHOLD
              ? Number(GATSBY_GRANT_VP_THRESHOLD)
              : getHighBudgetVpThreshold(Number(bid_proposal_data.funding))

          await ProposalService.createProposal({
            type: ProposalType.Bid,
            user: author_address,
            configuration: {
              id,
              linked_proposal_id,
              ...bid_proposal_data,
              choices: DEFAULT_CHOICES,
            },
            required_to_pass,
            finish_at,
          })
          await BidModel.removePendingBid(author_address, linked_proposal_id)
          context.log(`Bid from ${author_address} for tender ${linked_proposal_id} published`)
        } catch (error) {
          const msg = 'Error publishing bid for tender'
          ErrorService.report(msg, {
            error,
            author_address,
            linked_proposal_id,
            category: ErrorCategory.Bid,
          })
          context.log(msg + ` tender: ${linked_proposal_id}, author: ${author_address}`)
        }
      }
    }

    if (tendersWithBidsToReject.length > 0) {
      const tenderIds = tendersWithBidsToReject.join(', ')
      try {
        await BidModel.rejectBidsFromTenders(tendersWithBidsToReject)
        context.log(`Rejected bids from tenders ${tenderIds}`)
      } catch (error) {
        const msg = `Error rejecting bids`
        ErrorService.report(msg, { error, tenderIds, category: ErrorCategory.Bid })
        context.log(msg + ` tenders: ${tenderIds}`)
      }
    }
  }

  static async hasUserBidOnTender(user: string, tenderId: string) {
    const bids = await BidModel.getBidsInfoByTender(tenderId)
    return bids.find((bid) => bid.author_address === user) || null
  }

  static async isSubmissionWindowFinished(tenderId: string) {
    const bidsPromise = BidModel.getBidsInfoByTender(tenderId, BidStatus.Rejected)
    const proposalsAmountPromise = ProposalModel.getProposalTotal({
      linkedProposalId: tenderId,
      type: ProposalType.Bid,
    })

    const [bids, proposalsAmount] = await Promise.all([bidsPromise, proposalsAmountPromise])

    return bids.length > 0 || proposalsAmount > 0
  }
}
