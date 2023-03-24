/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/QuarterBudget/model'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      primaryKey: true,
      type: 'TEXT',
      notNull: true,
    },
    total: {
      type: 'DECIMAL',
      notNull: true,
    },
    start_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      unique: true,
    },
    finish_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: 'now()',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      default: 'now()',
      notNull: true,
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
}
