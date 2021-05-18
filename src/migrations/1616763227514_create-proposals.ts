/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true
    },
    snapshot_id: {
      type: 'TEXT',
      notNull: true
    },
    snapshot_space: {
      type: 'TEXT',
      notNull: true
    },
    snapshot_proposal: {
      type: 'TEXT',
      notNull: true
    },
    snapshot_signature: {
      type: 'TEXT',
      notNull: true
    },
    snapshot_network: {
      type: 'TEXT',
      notNull: true
    },
    discourse_id: {
      type: 'INT',
      notNull: true
    },
    discourse_topic_id: {
      type: 'INT',
      notNull: true
    },
    discourse_topic_slug: {
      type: 'TEXT',
      notNull: true
    },
    user: {
      type: 'TEXT',
      notNull: true
    },
    type: {
      type: 'TEXT',
      notNull: true
    },
    status: {
      type: 'TEXT',
      notNull: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    configuration: {
      type: 'TEXT',
      notNull: true,
    },
    enacted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    },
    enacted_description: {
      type: 'TEXT',
    },
    deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    },
    start_at: {
      type: 'TIMESTAMP',
      notNull: true
    },
    finish_at: {
      type: 'TIMESTAMP',
      notNull: true
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true
    },
    updated_at: {
      type: 'TIMESTAMP',
      notNull: true
    }
  })

  pgm.addIndex(Model.tableName, ['deleted', 'created_at'])
  pgm.addIndex(Model.tableName, ['deleted',  'user', 'created_at'])
  pgm.addIndex(Model.tableName, ['deleted',  'type', 'created_at'])
  pgm.addIndex(Model.tableName, ['deleted',  'status', 'created_at'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
}
