import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/User/model'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    address: {
      primaryKey: true,
      type: 'TEXT',
      notNull: true,
    },
    forum_id: {
      type: 'INTEGER',
      notNull: true,
    },
    forum_verification_date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  })

  pgm.addConstraint(Model.tableName, 'forum_id_unique', 'UNIQUE(forum_id)')
  pgm.addConstraint(Model.tableName, 'forum_id_check', 'CHECK(forum_id > 0)')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
