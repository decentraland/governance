/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import { resetEventType } from "./1706037450493_events-delegation-types"

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTypeValue('event_type', 'commented', 'proposal_commented')
  pgm.addTypeValue('event_type', 'project_update_commented', { ifNotExists: true })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.renameTypeValue('event_type', 'proposal_commented', 'commented')
  resetEventType(pgm)
}
