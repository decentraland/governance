import type { MigrationBuilder } from "node-pg-migrate"
import ProjectModel from "../back/models/Project"

const constraintName = 'unique_proposal_id'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addConstraint(ProjectModel.tableName, constraintName, {
    unique: ['proposal_id'],
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint(ProjectModel.tableName, constraintName)
}