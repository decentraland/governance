/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import EventModel from "../back/models/Event"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(EventModel.tableName, 'address', { notNull: true })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(EventModel.tableName, 'address', { notNull: false })
}
