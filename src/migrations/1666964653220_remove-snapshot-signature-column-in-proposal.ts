/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn(Model.tableName, 'snapshot_signature')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn(Model.tableName, {
    snapshot_signature: {
      type: 'TEXT',
      notNull: true,
    },
  })
}
