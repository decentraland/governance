import type { MigrationBuilder } from "node-pg-migrate"
// import { EventType } from "../shared/types/events"

export async function up(pgm: MigrationBuilder): Promise<void> {
   pgm.sql(`
    ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'proposal_finished';
    ALTER TYPE "event_type" ADD VALUE IF NOT EXISTS 'vesting_created';
  `)
}

export async function down(): Promise<void> {
  return
}