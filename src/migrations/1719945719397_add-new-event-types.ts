import type { MigrationBuilder } from "node-pg-migrate"
import { EventType } from "../shared/types/events"

export async function up(pgm: MigrationBuilder): Promise<void> {
  // ifNotExists: the create-events-table migration builds event_type from the current EventType enum,
  // which already includes these values on a fresh database.
  pgm.addTypeValue({ name: 'event_type' }, EventType.ProposalFinished, { ifNotExists: true })
  pgm.addTypeValue({ name: 'event_type' }, EventType.VestingCreated, { ifNotExists: true })
}

export async function down(): Promise<void> {
  return
}