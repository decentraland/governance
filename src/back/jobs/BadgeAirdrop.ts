import { Env } from '@dcl/ui-env'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { config } from '../../config'
import { BadgesService } from '../../services/BadgesService'
import AirdropJobModel, { AirdropJobAttributes } from '../models/AirdropJob'

export async function runAirdropJobs() {
  await Promise.all([runQueuedAirdropJobs(), giveAndRevokeLandOwnerBadges()])
}

async function runQueuedAirdropJobs() {
  const pendingJobs = await AirdropJobModel.getPending()
  if (pendingJobs.length === 0) {
    return
  }
  logger.log(`Running ${pendingJobs} airdrop jobs`)
  pendingJobs.map(async (pendingJob) => {
    const { id, badge_spec, recipients } = pendingJob
    const airdropOutcome = await BadgesService.giveBadgeToUsers(badge_spec, recipients)
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

async function giveAndRevokeLandOwnerBadges() {
  if (config.getEnv() === Env.PRODUCTION) {
    await BadgesService.giveAndRevokeLandOwnerBadges()
  }
}
