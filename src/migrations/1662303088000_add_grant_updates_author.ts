/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import ProposalModel from '../entities/Proposal/model'
import Model from '../entities/Updates/model'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns(Model.tableName, {
    author: {
      type: 'TEXT',
    },
  })
  pgm.addConstraint(
    Model.tableName,
    'fk_proposal',
    `FOREIGN KEY(proposal_id) REFERENCES ${ProposalModel.tableName}(${ProposalModel.primaryKey})`
  )

  const sql = `
    UPDATE ${Model.tableName} SET author = (SELECT p.user FROM ${ProposalModel.tableName} as p WHERE ${Model.tableName}.proposal_id = p.id) WHERE status = 'done'
  `
  pgm.sql(sql)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns(Model.tableName, ['author'])
}
