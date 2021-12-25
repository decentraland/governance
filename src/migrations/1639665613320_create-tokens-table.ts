/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Token/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true
    },
    contract: {
      type: 'TEXT',
      notNull: true
    },
    network: {
      type: 'TEXT',
      notNull: true
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    symbol: {
      type: 'TEXT',
      notNull: true
    },
    decimals: {
      type: 'INT',
      notNull: true
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
}
