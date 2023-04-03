/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Proposal/model'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(Model.tableName, 'configuration', { type: 'JSONB', using: 'configuration::JSONB' })
  pgm.createIndex(Model.tableName, 'configuration', { method: 'gin' })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex(Model.tableName, 'configuration')
  pgm.alterColumn(Model.tableName, 'configuration', { type: 'TEXT' })
}
