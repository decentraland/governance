/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/ProposalSurveyTopics/model'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
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
      type: 'TEXT',
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
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
}
