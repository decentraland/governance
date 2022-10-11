import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'

import { SurveyTopicAttributes } from './types'

export default class SurveyTopicModel extends Model<SurveyTopicAttributes> {
  static tableName = 'survey_topics'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createSurveyTopic(surveyTopic: Omit<SurveyTopicAttributes, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date()

    await this.create({
      id: uuid(),
      created_at: now,
      updated_at: now,
      ...surveyTopic,
    })
  }
}
