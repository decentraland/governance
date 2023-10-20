import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../back/models/UserNotificationConfig'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    address: {
      primaryKey: true,
      type: 'TEXT',
      notNull: true,
    },
    last_notification_id: {
      type: 'INTEGER',
      notNull: true,
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
