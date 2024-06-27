import type { MigrationBuilder } from "node-pg-migrate"
import EventModel from "../models/Event"

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createIndex(EventModel.tableName, [`(event_data->>'proposal_id')`])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex(EventModel.tableName, [`(event_data->>'proposal_id')`])
}