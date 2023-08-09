/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import Model from '../entities/Updates/model'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    discourse_topic_id: {
      type: 'INT',
      default: null,
    },
    discourse_topic_slug: {
      type: 'TEXT',
      default: null
    },
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, ['discourse_topic_id', 'discourse_topic_slug'])
}
