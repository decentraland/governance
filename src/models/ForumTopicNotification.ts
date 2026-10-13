import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { DiscourseTopicListItem } from '../shared/types/discourse'

export type ForumTopicNotificationAttributes = {
  topic_id: number
  category_id: number
  created_at: Date
}

// One row per forum topic the announcement job has taken on, whether it ended up announced or was
// skipped. A topic without a row has not been seen yet.
export default class ForumTopicNotificationModel extends Model<ForumTopicNotificationAttributes> {
  static tableName = 'forum_topic_notifications'
  static withTimestamps = false
  static primaryKey = 'topic_id'

  // The insert is the claim: the primary key lets a topic through once, so when the job runs on more
  // than one instance each topic is handed to exactly one of them. Answers the topic ids claimed now.
  static async claim(topics: Pick<DiscourseTopicListItem, 'id' | 'category_id'>[]): Promise<number[]> {
    if (topics.length === 0) {
      return []
    }

    const rows = topics.map(({ id, category_id }) => SQL`(${id}, ${category_id})`)
    const query = SQL`
        INSERT INTO ${table(this)} ("topic_id", "category_id")
        VALUES ${join(rows)}
        ON CONFLICT ("topic_id") DO NOTHING
        RETURNING "topic_id"
    `

    const claimed = await this.namedQuery<{ topic_id: number }>('claim_forum_topic_notifications', query)
    return claimed.map(({ topic_id }) => topic_id)
  }

  // Hands a claimed topic back so the next run can retry it.
  static async release(topicId: number) {
    const query = SQL`
        DELETE FROM ${table(this)}
        WHERE "topic_id" = ${topicId}
    `

    return this.namedRowCount('release_forum_topic_notification', query)
  }
}
