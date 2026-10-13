import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../models/ForumTopicNotification'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    topic_id: {
      type: 'INTEGER',
      primaryKey: true,
      notNull: true,
    },
    category_id: {
      type: 'INTEGER',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
