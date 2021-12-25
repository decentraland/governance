/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Balance/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true
    },
    wallet_id: {
      type: 'TEXT',
      notNull: true
    },
    token_id: {
      type: 'TEXT',
      notNull: true
    },
    amount: {
      type: 'TEXT',
      notNull: true
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: false })
}
