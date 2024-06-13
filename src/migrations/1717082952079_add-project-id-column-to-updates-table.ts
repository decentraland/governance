import type { MigrationBuilder } from "node-pg-migrate"
import UpdateModel from "../entities/Updates/model"
import ProjectModel from "../back/models/Project"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn(UpdateModel.tableName, {
    project_id: {
      type: 'TEXT',
      notNull: false,
    },
  })
  pgm.addConstraint(UpdateModel.tableName, 'fk_project_id', {
    foreignKeys: {
      columns: ['project_id'],
      references: `${ProjectModel.tableName}(id)`,
    },
  })
  const query = `
    UPDATE ${UpdateModel.tableName}
    SET project_id = p.id
    FROM ${ProjectModel.tableName} p
    WHERE ${UpdateModel.tableName}.proposal_id = p.proposal_id
  `
  pgm.sql(query)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint(UpdateModel.tableName, 'fk_project_id', {ifExists: true})
  pgm.dropColumn(UpdateModel.tableName, 'project_id')
}