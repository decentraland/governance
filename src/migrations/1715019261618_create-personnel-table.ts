import { MigrationBuilder } from "node-pg-migrate"

import Model, { PersonnelStatus } from "../back/models/Personnel"
import ProjectModel from "../back/models/Project"

const STATUS_TYPE = 'personnel_status_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(STATUS_TYPE, Object.values(PersonnelStatus))
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    project_id: {
      type: 'TEXT',
      notNull: true
    },
    address: {
      type: 'TEXT',
    },
    name: {
      type: 'TEXT',
      notNull: true
    },
    role: {
      type: 'TEXT',
      notNull: true
    },
    about: {
      type: 'TEXT',
      notNull: true
    },
    relevantLink: {
      type: 'TEXT',
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
    },
    updated_by: {
      type: 'TEXT',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
  })

  pgm.createIndex(Model.tableName, 'project_id')
  pgm.addConstraint(Model.tableName, 'address_check', 'CHECK(address ~* \'^(0x)?[0-9a-f]{40}$\')')
  pgm.addConstraint(Model.tableName, 'project_id_fk', `FOREIGN KEY(project_id) REFERENCES ${ProjectModel.tableName}(id)`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropType(STATUS_TYPE, { cascade: true })
}
