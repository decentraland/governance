import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    leading_option: {
      type: 'TEXT',
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, [ 'leading_option' ])
}
