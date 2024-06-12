/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder } from "node-pg-migrate"
import Model from "../back/models/ProjectMilestoneUpdate"
import ProjectMilestoneModel from "../back/models/ProjectMilestone"

const LEGACY_TABLE_NAME = 'proposal_updates'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(Model.tableName, {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    update_id: {
      type: 'TEXT',
      notNull: true
    },
    milestone_id: {
      type: 'TEXT',
      notNull: true
    },
    description: {
      type: 'TEXT',
      notNull: true
    },
    tasks: {
      type: 'TEXT[]',
      notNull: true,
      default: '{}'
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
  })

  pgm.createIndex(Model.tableName, 'update_id')
  pgm.addConstraint(Model.tableName, 'update_id_fk', `FOREIGN KEY(update_id) REFERENCES ${LEGACY_TABLE_NAME}(id)`)
  pgm.createIndex(Model.tableName, 'milestone_id')
  pgm.addConstraint(Model.tableName, 'milestone_id_fk', `FOREIGN KEY(milestone_id) REFERENCES ${ProjectMilestoneModel.tableName}(id)`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
