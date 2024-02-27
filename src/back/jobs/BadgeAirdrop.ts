import { ActionStatus } from '../../entities/Badges/types'
import { BadgesService } from '../../services/BadgesService'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'
import logger from '../../utils/logger'
import AirdropJobModel, { AirdropJobAttributes } from '../models/AirdropJob'
import { AirdropJobStatus } from '../types/AirdropJob'

export async function runAirdropJobs() {
  await Promise.all([runQueuedAirdropJobs(), giveAndRevokeLandOwnerBadges()])
}

export async function runQueuedAirdropJobs() {
  const pendingJobs = await AirdropJobModel.getPending()
  if (pendingJobs.length === 0) {
    return
  }
  logger.log(`Running ${pendingJobs.length} airdrop jobs`)
  pendingJobs.map(async (pendingJob) => {
    const { id, badge_spec, recipients } = pendingJob
    const airdropOutcome = await BadgesService.giveBadgeToUsers(badge_spec, recipients)
    logger.log('Airdrop Outcome', airdropOutcome)
    if (airdropOutcome.status === AirdropJobStatus.FAILED) {
      ErrorService.report('Airdrop job failed', {
        category: ErrorCategory.Badges,
        id,
        badge_spec,
        recipients,
        error: airdropOutcome.error,
      })
    }
    await AirdropJobModel.update<AirdropJobAttributes>(
      {
        ...airdropOutcome,
        updated_at: new Date(),
      },
      { id }
    )
  })
}

export async function giveAndRevokeLandOwnerBadges() {
  if (isProdEnv()) {
    await BadgesService.giveAndRevokeLandOwnerBadges()
  }
}

export async function giveTopVoterBadges() {
  const { status, badgeCid, badgeTitle, error } = await BadgesService.createTopVotersBadgeSpec()
  if (error && status === ActionStatus.Failed) {
    ErrorService.report(error, { category: ErrorCategory.Badges, badgeTitle, badgeCid })
    return
  }
  if (!badgeCid) {
    ErrorService.report('Unable to create top voters badge', { category: ErrorCategory.Badges, badgeTitle })
    return
  }
  await BadgesService.queueTopVopVoterAirdrops(badgeCid!)
}
