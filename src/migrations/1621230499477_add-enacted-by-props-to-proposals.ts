/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    enacted_by: {
      type: 'TEXT',
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, [ 'enacted_by' ])
}
