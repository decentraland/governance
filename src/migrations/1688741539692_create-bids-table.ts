import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Bid/model'
import ProposalModel from '../entities/Proposal/model'
import { UnpublishedBidStatus } from '../entities/Bid/types'

const STATUS_TYPE = 'bid_status_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('pgcrypto', { ifNotExists: true })
  pgm.createType(STATUS_TYPE, Object.values(UnpublishedBidStatus))
  pgm.createTable(Model.tableName, {
    id: {
      type: 'SERIAL',
      primaryKey: true,
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
    publish_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
    author_address: {
      type: 'TEXT',
      notNull: true,
    },
    linked_proposal_id: {
      type: 'TEXT',
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

  pgm.addConstraint(Model.tableName, 'linked_proposal_id_fk', `FOREIGN KEY(linked_proposal_id) REFERENCES ${ProposalModel.tableName}(id)`)
  pgm.addConstraint(Model.tableName, 'author_address_check', 'CHECK(author_address ~* \'^(0x)?[0-9a-f]{40}$\')')
  pgm.addConstraint(Model.tableName, 'author_and_tender_unique', 'UNIQUE(linked_proposal_id, author_address)')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropExtension('pgcrypto', { ifExists: true })
  pgm.dropType(STATUS_TYPE, { cascade: true })
}
