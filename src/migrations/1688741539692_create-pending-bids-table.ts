import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/PendingBids/model'
import ProposalModel from '../entities/Proposal/model'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('pgcrypto', { ifNotExists: true })
  pgm.createTable(Model.tableName, {
    id: {
      type: 'SERIAL',
      primaryKey: true,
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    publish_at: {
      type: 'TIMESTAMP',
      notNull: true,
    },
    author_address: {
      type: 'TEXT',
      notNull: true,
    },
    tender_id: {
      type: 'TEXT',
      notNull: true,
    },
    bid_proposal_data: {
      type: 'TEXT',
      notNull: true,
    },
  })

  pgm.addConstraint(Model.tableName, 'tender_id_fk', `FOREIGN KEY(tender_id) REFERENCES ${ProposalModel.tableName}(id)`)
  pgm.addConstraint(Model.tableName, 'author_address_check', 'CHECK(author_address ~* \'^(0x)?[0-9a-f]{40}$\')')
  pgm.addIndex(Model.tableName, ['author_address', 'tender_id'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropExtension('pgcrypto', { ifExists: true })
}