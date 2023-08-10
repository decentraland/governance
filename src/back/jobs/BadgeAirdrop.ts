import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { BadgesService } from '../../services/BadgesService'
import AirdropJobModel, { AirdropJobAttributes, AirdropOutcome } from '../models/AirdropJob'

export async function runAirdropJobs() {
  const pendingJobs: AirdropJobAttributes[] = await AirdropJobModel.getPending()
  if (pendingJobs.length > 0) {
    logger.log(`Running ${pendingJobs} airdrop jobs`)
  }
  pendingJobs.map(async (pendingJob) => {
    const { id, badge_spec, recipients } = pendingJob
    const airdropOutcome: AirdropOutcome = await BadgesService.giveBadgeToUsers(badge_spec, recipients)
    logger.log('Airdrop Outcome', airdropOutcome)
    await AirdropJobModel.update<AirdropJobAttributes>(
      {
        ...airdropOutcome,
        updated_at: new Date(),
      },
      { id }
    )
  })
}
