/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import AirdropJobModel from "../models/AirdropJob"
import { AirdropJobStatus } from "../types/AirdropJob"

export const shorthands: ColumnDefinitions | undefined = undefined

const STATUS_TYPE = 'airdrop_job_status'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(STATUS_TYPE, Object.values(AirdropJobStatus))
  const columns: ColumnDefinitions = {
    id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    badge_spec: {
      type: 'TEXT',
      notNull: true,
    },
    recipients: {
      type: 'TEXT[]',
      notNull: true,
    },
    status: {
      type: STATUS_TYPE,
      notNull: true,
      default: AirdropJobStatus.PENDING,
    },
    error: {
      type: 'TEXT',
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  }

  pgm.createTable(AirdropJobModel.tableName, columns)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(AirdropJobModel.tableName)
  pgm.dropType(STATUS_TYPE)
}
