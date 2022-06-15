import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Coauthor/model'
import { CoauthorStatus } from '../entities/Coauthor/types'
import ProposalModel from '../entities/Proposal/model'

const STATUS_TYPE = 'status_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(STATUS_TYPE, Object.values(CoauthorStatus))

  pgm.createTable(Model.tableName, {
    proposal_id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    address: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
    },
  })

  pgm.addConstraint(
    Model.tableName,
    'fk_proposal',
    `FOREIGN KEY(${Model.primaryKey}) REFERENCES ${ProposalModel.tableName}(${ProposalModel.primaryKey})`
  )

  pgm.addIndex(Model.tableName, ['proposal_id', 'address'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
  pgm.dropType(STATUS_TYPE, { cascade: true })
}
