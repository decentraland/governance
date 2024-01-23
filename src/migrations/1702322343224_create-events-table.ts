/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import EventModel from "../back/models/Event"
import { EventType } from "../shared/types/events"

export const shorthands: ColumnDefinitions | undefined = undefined

export const EVENT_TYPE = 'event_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(EVENT_TYPE, Object.values(EventType))
  const columns: ColumnDefinitions = {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    address: {
      type: 'TEXT',
      notNull: true,
    },
    event_type: {
      type: EVENT_TYPE,
      notNull: true,
    },
    event_data: {
      type: 'JSONB',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }

  pgm.createTable(EventModel.tableName, columns)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(EventModel.tableName)
  pgm.dropType(EVENT_TYPE)
}
