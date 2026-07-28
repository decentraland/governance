import type { MigrationBuilder } from 'node-pg-migrate'

// Idempotent rename: on a fresh database the updates table is already created as project_updates
// (see create-proposal-updates), so IF EXISTS makes this a no-op there while still renaming any
// legacy proposal_updates table that predates the create migration's current name.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('ALTER TABLE IF EXISTS proposal_updates RENAME TO project_updates')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('ALTER TABLE IF EXISTS project_updates RENAME TO proposal_updates')
}
