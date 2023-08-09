import { BadgesService } from '../../services/BadgesService'
import AirdropJobModel, { AirdropJobAttributes, AirdropOutcome } from '../models/AirdropJob'

export async function runAirdropJobs() {
  console.log('running airdrops')
  const pendingJobs: AirdropJobAttributes[] = await AirdropJobModel.getPending()
  pendingJobs.map(async (pendingJob) => {
    const { id, badge_spec, recipients } = pendingJob
    const airdropOutcome: AirdropOutcome = await BadgesService.giveBadgeToUsers(badge_spec, recipients)
    console.log('airdropOutcome', airdropOutcome)
    await AirdropJobModel.update<AirdropJobAttributes>(
      {
        ...airdropOutcome,
        updated_at: new Date(),
      },
      { id }
    )
  })
}
