import { MigrationBuilder } from "node-pg-migrate"
import Model from "../models/Financial"

export async function up(pgm: MigrationBuilder): Promise<void> {

  pgm.alterColumn(Model.tableName, 'link', {
    type: 'TEXT',
    notNull: false,
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(Model.tableName, 'link', {
    type: 'TEXT',
    notNull: true,
  })
}