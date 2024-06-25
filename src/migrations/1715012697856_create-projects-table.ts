import { MigrationBuilder } from 'node-pg-migrate'

import Model from '../models/Project'
import { ProjectStatus } from "../entities/Grant/types"
import ProposalModel from "../entities/Proposal/model"

const STATUS_TYPE = 'project_status_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(STATUS_TYPE, Object.values(ProjectStatus))
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    proposal_id: {
      type: 'TEXT',
      notNull: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
    },
    links: {
      type: 'TEXT[]',
      notNull: true,
      default: '{}'
    },
    about: {
      type: 'TEXT',
    },
    about_updated_by: {
      type: 'TEXT',
    },
    about_updated_at: {
      type: 'TIMESTAMPTZ',
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
  })

  pgm.createIndex(Model.tableName, 'proposal_id')
  pgm.addConstraint(Model.tableName, 'proposal_id_fk', `FOREIGN KEY(proposal_id) REFERENCES ${ProposalModel.tableName}(id)`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropType(STATUS_TYPE, { cascade: true })
}
