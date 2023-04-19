import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Discourse/model'

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
    user_api_key_encrypted: {
      type: 'TEXT',
      notNull: true,
    },
    expiration_date: {
      type: 'TIMESTAMP',
      notNull: true,
    },
  })

  pgm.addConstraint(Model.tableName, 'forum_id_unique', 'UNIQUE(forum_id)')
  pgm.addConstraint(Model.tableName, 'expiration_date_check', 'CHECK(expiration_date > now())')
  pgm.addConstraint(Model.tableName, 'forum_id_check', 'CHECK(forum_id > 0)')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
