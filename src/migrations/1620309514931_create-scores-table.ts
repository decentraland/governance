/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Votes/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    proposal_id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true
    },
    hash: {
      type: 'TEXT',
      notNull: true
    },
    votes: {
      type: 'TEXT',
      notNull: true
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
