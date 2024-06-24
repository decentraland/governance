import UpdateModel from '../../entities/Updates/model'
import { DiscourseService } from '../../services/DiscourseService'
import { ProposalService } from '../../services/ProposalService'
import logger from '../../utils/logger'

export async function restoreMissingUpdatesForumPost() {
  const affectedUpdates = await UpdateModel.getUpdatesWithoutForumPost()
  logger.log(
    `Found ${affectedUpdates.length} updates without forum post. IDs: ${affectedUpdates
      .map((update) => update.id)
      .join(', ')}`
  )
  for (const update of affectedUpdates) {
    const { title } = await ProposalService.getProposal(update.proposal_id)
    await DiscourseService.createUpdate(update, title)
  }
}
