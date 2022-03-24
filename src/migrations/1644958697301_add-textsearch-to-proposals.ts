/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import ProposalModel from "../entities/Proposal/model"

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(ProposalModel.tableName, {
    textsearch: {
      type: 'tsvector',
      default: ""
    }
  })

  pgm.sql(`
    UPDATE "${ProposalModel.tableName}"
    SET "textsearch" = (
      setweight(to_tsvector("title"), 'A') ||
      setweight(to_tsvector("user"), 'B') ||
      setweight(to_tsvector("description"), 'C')
    )
    WHERE vesting_address IS NULL`)

  pgm.sql(`
    UPDATE "${ProposalModel.tableName}"
    SET "textsearch" = (
      setweight(to_tsvector("title"), 'A') ||
      setweight(to_tsvector("user"), 'B') ||
      setweight(to_tsvector("vesting_address"), 'B') ||
      setweight(to_tsvector("description"), 'C')
    )
    WHERE vesting_address IS NOT NULL`)

  pgm.createIndex(ProposalModel.tableName, ["textsearch"], { method: 'gin' })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(ProposalModel.tableName, [ 'textsearch' ])
}
