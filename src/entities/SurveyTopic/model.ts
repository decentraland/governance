import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, conditional, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import { pick } from 'lodash'

import { ProposalAttributes } from '../Proposal/types'
import { getProposalCategory } from '../Proposal/utils'
import ProposalSurveyTopicModel from '../ProposalSurveyTopics/model'

import { SurveyTopicAttributes, Topic } from './types'

export default class SurveyTopicModel extends Model<SurveyTopicAttributes> {
  static tableName = 'survey_topics'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getSurveyTopic(proposal: ProposalAttributes): Promise<Topic[]> {
    const proposalCategory = getProposalCategory(proposal)
    return await this.query(SQL`
    SELECT s.topic_id
    FROM ${table(SurveyTopicModel)} s
        INNER JOIN ${table(ProposalSurveyTopicModel)} ps ON ps."topic_id" = s."topic_id"
        WHERE ps."proposal_type" = ${proposal.type}
        ${conditional(!!proposalCategory, SQL`AND ps."proposal_sub_types" LIKE '%' || ${proposalCategory} || '%'`)}
    ;`)
  }
}
