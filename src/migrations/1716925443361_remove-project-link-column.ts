/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import Model from "../models/Project"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, [ 'links' ])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    links: {
      type: 'TEXT[]',
      notNull: true,
      default: '{}'
    },
  })
}
