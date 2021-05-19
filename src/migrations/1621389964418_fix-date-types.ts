/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import ProposalModel from '../entities/Proposal/model'
import VotesModel from '../entities/Votes/model'
import SubscriptionModel from '../entities/Subscription/model'

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn(ProposalModel.tableName, 'start_at', { type: 'TIMESTAMPTZ' })
  pgm.alterColumn(ProposalModel.tableName, 'finish_at', { type: 'TIMESTAMPTZ' })
  pgm.alterColumn(ProposalModel.tableName, 'created_at', { type: 'TIMESTAMPTZ' })
  pgm.alterColumn(ProposalModel.tableName, 'updated_at', { type: 'TIMESTAMPTZ' })

  pgm.alterColumn(VotesModel.tableName, 'created_at', { type: 'TIMESTAMPTZ' })
  pgm.alterColumn(VotesModel.tableName, 'updated_at', { type: 'TIMESTAMPTZ' })

  pgm.alterColumn(SubscriptionModel.tableName, 'created_at', { type: 'TIMESTAMPTZ' })
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
