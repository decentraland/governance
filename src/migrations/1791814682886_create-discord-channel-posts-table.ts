import { MigrationBuilder } from 'node-pg-migrate'

import Model, { DiscordChannelPostStatus } from '../models/DiscordChannelPost'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    message: {
      type: 'JSONB',
      notNull: true,
    },
    status: {
      type: 'TEXT',
      notNull: true,
      default: DiscordChannelPostStatus.Pending,
    },
    attempts: {
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
    next_attempt_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    error: {
      type: 'TEXT',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  })

  pgm.createIndex(Model.tableName, ['status', 'next_attempt_at'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
