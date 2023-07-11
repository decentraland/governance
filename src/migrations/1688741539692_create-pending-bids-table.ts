import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Bid/model'
import ProposalModel from '../entities/Proposal/model'
import { BidStatus } from '../entities/Bid/types'

const STATUS_TYPE = 'bid_status_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('pgcrypto', { ifNotExists: true })
  pgm.createType(STATUS_TYPE, Object.values(BidStatus))
  pgm.createTable(Model.tableName, {
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
      primaryKey: true,
      notNull: true,
    },
    tender_id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    bid_proposal_data: {
      type: 'TEXT',
      notNull: true,
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
    },
  })

  pgm.addConstraint(Model.tableName, 'tender_id_fk', `FOREIGN KEY(tender_id) REFERENCES ${ProposalModel.tableName}(id)`)
  pgm.addConstraint(Model.tableName, 'author_address_check', 'CHECK(author_address ~* \'^(0x)?[0-9a-f]{40}$\')')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropExtension('pgcrypto', { ifExists: true })
  pgm.dropType(STATUS_TYPE, { cascade: true })
}