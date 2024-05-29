import { MigrationBuilder } from "node-pg-migrate"
import ProjectModel from "../back/models/Project"
import Model from "../back/models/ProjectLink"

export async function up(pgm: MigrationBuilder): Promise<void> {
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
    label: {
      type: 'TEXT',
      notNull: true
    },
    url: {
      type: 'TEXT',
      notNull: true
    },
    updated_by: {
      type: 'TEXT',
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
    },
    created_by: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },
  })

  pgm.createIndex(Model.tableName, 'project_id')
  pgm.addConstraint(Model.tableName, 'project_id_fk', `FOREIGN KEY(project_id) REFERENCES ${ProjectModel.tableName}(id)`)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}
