import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import EventModel from "../back/models/Event"
import { EventType } from "../shared/types/events"
import { EVENT_TYPE } from "./1702322343224_create-events-table"

export const shorthands: ColumnDefinitions | undefined = undefined

const EVENT_TYPE_OLD = 'event_type_old'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameType(EVENT_TYPE, EVENT_TYPE_OLD)
  pgm.createType(EVENT_TYPE, Object.values(EventType))
  pgm.alterColumn(EventModel.tableName, 'event_type', {
    type: EVENT_TYPE,
    using: `"event_type"::text::${EVENT_TYPE}`
  })
  pgm.dropType(EVENT_TYPE_OLD)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.renameType(EVENT_TYPE, EVENT_TYPE_OLD)
  pgm.createType(EVENT_TYPE, Object.values(EventType))
  pgm.alterColumn(EventModel.tableName, 'event_type', {
    type: EVENT_TYPE,
    using: `"event_type"::text::${EVENT_TYPE}`
  })
  pgm.dropType(EVENT_TYPE_OLD)
}
