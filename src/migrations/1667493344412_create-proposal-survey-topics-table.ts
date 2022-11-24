/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import { ProposalType } from '../entities/Proposal/types'
import Model from '../entities/ProposalSurveyTopics/model'
import SurveyTopicModel from '../entities/SurveyTopic/model'

export const shorthands: ColumnDefinitions | undefined = undefined
const PROPOSAL_TYPE = 'proposal_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(PROPOSAL_TYPE, Object.values(ProposalType))

  pgm.createTable(Model.tableName, {
    id: {
      primaryKey: true,
      type: 'TEXT',
      notNull: true,
    },
    topic_id: {
      type: 'TEXT',
      notNull: true,
    },
    proposal_type: {
      type: PROPOSAL_TYPE,
      notNull: true,
    },
    proposal_sub_types: {
      type: 'TEXT',
      notNull: false,
    },
    created_at: {
      type: 'TIMESTAMP',
      default: 'now()',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMP',
      default: 'now()',
      notNull: true,
    },
  })

  pgm.addConstraint(Model.tableName, 'fk_topic', `FOREIGN KEY(topic_id) REFERENCES survey_topics(topic_id)`)

  // pgm.addConstraint(
  //   Model.tableName,
  //   'fk_topic',
  //   `FOREIGN KEY(${Model.topic_id}) REFERENCES ${SurveyTopicModel.tableName}(${SurveyTopicModel.topic_id})`
  // )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropType(PROPOSAL_TYPE, { cascade: true })
}
