/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"

export const shorthands: ColumnDefinitions | undefined = undefined

// The badge airdrop model and its status enum were removed when badges were retired, so the
// values they supplied are inlined here: an applied migration must keep loading and keep its meaning.
const TABLE_NAME = 'airdrop_jobs'
const STATUS_TYPE = 'airdrop_job_status'
const STATUS_VALUES = ['pending', 'finished', 'failed']

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(STATUS_TYPE, STATUS_VALUES)
  const columns: ColumnDefinitions = {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    badge_spec: {
      type: 'TEXT',
      notNull: true,
    },
    recipients: {
      type: 'TEXT[]',
      notNull: true,
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
      default: 'pending',
    },
    error: {
      type: 'TEXT',
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }

  pgm.createTable(TABLE_NAME, columns)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(TABLE_NAME)
  pgm.dropType(STATUS_TYPE)
}
