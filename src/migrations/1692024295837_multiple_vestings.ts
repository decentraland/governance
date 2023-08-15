import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Proposal/model'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(Model.tableName, 'vesting_address', { type: 'TEXT[]', using: "CASE WHEN vesting_address IS NULL THEN '{}'::TEXT[] ELSE ARRAY[vesting_address] END"})
  pgm.alterColumn(Model.tableName, 'vesting_address', { notNull: true })
  pgm.renameColumn(Model.tableName, 'vesting_address', 'vesting_addresses')
}
