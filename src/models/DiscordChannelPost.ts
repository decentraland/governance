import { randomUUID } from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import type { ChannelMessage } from '../services/discord'

export enum DiscordChannelPostStatus {
  Pending = 'pending',
  Sending = 'sending',
  Sent = 'sent',
  Failed = 'failed',
}

export type DiscordChannelPostAttributes = {
  id: string
  message: ChannelMessage
  status: DiscordChannelPostStatus
  attempts: number
  next_attempt_at: Date
  error: string | null
  created_at: Date
  updated_at: Date
}

// Messages for the governance discord channel, queued where the event happens and sent by a job, so
// one that fails to go out is retried instead of lost. A post left in sending was claimed by a run
// that never finished; it stays there rather than risk going out twice.
export default class DiscordChannelPostModel extends Model<DiscordChannelPostAttributes> {
  static tableName = 'discord_channel_posts'
  static withTimestamps = false
  static primaryKey = 'id'

  static async enqueue(message: ChannelMessage): Promise<string> {
    const id = randomUUID()
    const query = SQL`
        INSERT INTO ${table(this)} ("id", "message", "status")
        VALUES (${id}, ${JSON.stringify(message)}, ${DiscordChannelPostStatus.Pending})
    `

    await this.namedRowCount('enqueue_discord_channel_post', query)
    return id
  }

  // Selecting and marking happen in one statement, and rows another session is claiming are skipped
  // rather than waited on, so two runs never get the same post.
  static async claimDue(limit: number): Promise<DiscordChannelPostAttributes[]> {
    const query = SQL`
        UPDATE ${table(this)}
        SET "status"     = ${DiscordChannelPostStatus.Sending},
            "attempts"   = "attempts" + 1,
            "updated_at" = now()
        WHERE "id" IN (
            SELECT "id"
            FROM ${table(this)}
            WHERE "status" = ${DiscordChannelPostStatus.Pending}
              AND "next_attempt_at" <= now()
            ORDER BY "created_at"
            LIMIT ${limit}
            FOR UPDATE SKIP LOCKED
        )
        RETURNING *
    `

    const claimed = await this.namedQuery<DiscordChannelPostAttributes>('claim_due_discord_channel_posts', query)
    // RETURNING does not keep the subquery's order.
    return claimed.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  static async markSent(id: string) {
    return this.finish(id, DiscordChannelPostStatus.Sent, null)
  }

  static async markFailed(id: string, error: string) {
    return this.finish(id, DiscordChannelPostStatus.Failed, error)
  }

  static async retryLater(id: string, error: string, nextAttemptAt: Date) {
    const query = SQL`
        UPDATE ${table(this)}
        SET "status"          = ${DiscordChannelPostStatus.Pending},
            "error"           = ${error},
            "next_attempt_at" = ${nextAttemptAt},
            "updated_at"      = now()
        WHERE "id" = ${id}
          AND "status" = ${DiscordChannelPostStatus.Sending}
    `

    return this.namedRowCount('retry_discord_channel_post', query)
  }

  private static async finish(id: string, status: DiscordChannelPostStatus, error: string | null) {
    const query = SQL`
        UPDATE ${table(this)}
        SET "status"     = ${status},
            "error"      = ${error},
            "updated_at" = now()
        WHERE "id" = ${id}
          AND "status" = ${DiscordChannelPostStatus.Sending}
    `

    return this.namedRowCount('finish_discord_channel_post', query)
  }
}
