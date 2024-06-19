import UpdateModel from '../../entities/Updates/model'
import { DiscourseService } from '../../services/DiscourseService'
import { ProposalService } from '../../services/ProposalService'

export async function restoreMissingUpdatesForumPost() {
  const affectedUpdates = await UpdateModel.getUpdatesWithoutForumPost()
  for (const update of affectedUpdates) {
    const { title } = await ProposalService.getProposal(update.proposal_id)
    await DiscourseService.createUpdate(update, title)
  }
}
