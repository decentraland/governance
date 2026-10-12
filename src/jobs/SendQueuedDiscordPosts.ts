import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { DISCORD_SERVICE_ENABLED } from '../constants'
import { ErrorService } from '../services/ErrorService'
import { DiscordService } from '../services/discord'
import { ErrorCategory } from '../utils/errorCategories'

// Sends the new proposal, new update and finished proposal posts queued for the governance channel.
// Nothing is claimed while discord is off, so the queue waits for it to be turned back on.
export async function sendQueuedDiscordPosts(context: JobContext) {
  if (!DISCORD_SERVICE_ENABLED) {
    return
  }

  try {
    const sent = await DiscordService.sendQueuedChannelPosts()
    if (sent > 0) {
      context.log(`Sent ${sent} queued Discord channel posts...`)
    }
  } catch (error) {
    ErrorService.report('Error sending queued Discord channel posts', { error, category: ErrorCategory.Job })
  }
}
