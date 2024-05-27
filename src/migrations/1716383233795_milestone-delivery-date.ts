import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import Model from '../back/models/ProjectMilestone'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    delivery_date: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn(Model.tableName, 'delivery_date')
}
