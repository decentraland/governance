import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { BadgesService } from '../../services/BadgesService'
import { isProdEnv } from '../../utils/governanceEnvs'
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
  if (isProdEnv()) {
    await BadgesService.giveAndRevokeLandOwnerBadges()
  }
}

export async function giveTopVoterBadges() {
  const badgeCid = await BadgesService.createTopVotersBadge()
  await BadgesService.queueTopVopVoterAirdrops(badgeCid)
}
