import { MigrationBuilder } from 'node-pg-migrate'

import ProposalModel from '../entities/Proposal/model'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn(ProposalModel.tableName, {
    voting_ends_soon_notified_at: { type: 'TIMESTAMP', notNull: false },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn(ProposalModel.tableName, 'voting_ends_soon_notified_at')
}
