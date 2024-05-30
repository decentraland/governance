import type { MigrationBuilder } from "node-pg-migrate"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTable('proposal_updates', 'project_updates')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTable('project_updates', 'proposal_updates')
}