import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { ProposalSurveyTopicAttributes } from './type'

export default class ProposalSurveyTopicModel extends Model<ProposalSurveyTopicAttributes> {
  static tableName = 'proposal_survey_topics'
  static withTimestamps = false
  static primaryKey = 'id'
}
