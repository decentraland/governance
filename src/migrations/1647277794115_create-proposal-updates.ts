/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Updates/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      primaryKey: true,
      type: 'TEXT',
      notNull: true
    },
    proposal_id: {
      type: 'TEXT',
      notNull: true
    },
    health: {
      type: 'TEXT',
    },
    introduction: {
      type: 'TEXT',
    },
    highlights: {
      type: 'TEXT',
    },
    blockers: {
      type: 'TEXT',
    },
    next_steps: {
      type: 'TEXT',
    },
    additional_notes: {
      type: 'TEXT',
    },
    status: {
      type: 'TEXT',
      notNull: true
    },
    due_date: {
      type: 'TIMESTAMP',
    },
    completion_date: {
      type: 'TIMESTAMP',
    },
    created_at: {
      type: 'TIMESTAMP',
      default: 'now()',
      notNull: true
    },
    updated_at: {
      type: 'TIMESTAMP',
      default: 'now()',
      notNull: true
    }
  })

  pgm.addIndex(Model.tableName, ['proposal_id', 'created_at'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
}
