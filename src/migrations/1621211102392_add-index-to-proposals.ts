/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import Model from '../entities/Proposal/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addIndex(Model.tableName, ['deleted',  'status', 'start_at'])
  pgm.addIndex(Model.tableName, ['deleted',  'status', 'finish_at'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex(Model.tableName, ['deleted',  'status', 'start_at'])
  pgm.dropIndex(Model.tableName, ['deleted',  'status', 'finish_at'])
}