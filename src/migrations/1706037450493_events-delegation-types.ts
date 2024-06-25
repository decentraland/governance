import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import EventModel from "../models/Event"
import { EventType } from "../shared/types/events"
import { EVENT_TYPE } from "./1702322343224_create-events-table"

export const shorthands: ColumnDefinitions | undefined = undefined

const EVENT_TYPE_OLD = 'event_type_old'

export function resetEventType(pgm: MigrationBuilder) {
  pgm.renameType(EVENT_TYPE, EVENT_TYPE_OLD)
  pgm.createType(EVENT_TYPE, Object.values(EventType))
  pgm.alterColumn(EventModel.tableName, EVENT_TYPE, {
    type: EVENT_TYPE,
    using: `"${EVENT_TYPE}"::text::${EVENT_TYPE}`
  })
  pgm.dropType(EVENT_TYPE_OLD)
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  resetEventType(pgm)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  resetEventType(pgm)
}
