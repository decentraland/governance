import type { MigrationBuilder } from "node-pg-migrate"
import { EventType } from "../shared/types/events"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addTypeValue({name: 'event_type'}, EventType.ProposalFinished)
  pgm.addTypeValue({name: 'event_type'}, EventType.VestingCreated)
}

export async function down(): Promise<void> {
  return
}