import type { MigrationBuilder } from "node-pg-migrate"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$BEGIN
      IF to_regclass('public.proposal_updates') IS NOT NULL THEN
        ALTER TABLE proposal_updates RENAME TO project_updates;
      END IF;
    END$$;
  `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$BEGIN
      IF to_regclass('public.project_updates') IS NOT NULL THEN
        ALTER TABLE project_updates RENAME TO proposal_updates;
      END IF;
    END$$;
  `)
}