/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    passed_by: {
      type: 'TEXT',
      default: null,
    },
    passed_description: {
      type: 'TEXT',
      default: null
    },
    rejected_by: {
      type: 'TEXT',
      default: null,
    },
    rejected_description: {
      type: 'TEXT',
      default: null
    }
  })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, [ 'passed_by', 'passed_description', 'rejected_by', 'rejected_description' ])
}
