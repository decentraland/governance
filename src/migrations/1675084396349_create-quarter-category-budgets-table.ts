/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import { ProposalGrantCategory } from '../entities/Proposal/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import Model from '../entities/QuarterCategoryBudget/model'

export const shorthands: ColumnDefinitions | undefined = undefined

const PROPOSAL_GRANT_CATEGORY_TYPE = 'proposal_grant_category_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(PROPOSAL_GRANT_CATEGORY_TYPE, Object.values(ProposalGrantCategory))

  pgm.createTable(Model.tableName, {
    quarter_budget_id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    category: {
      type: PROPOSAL_GRANT_CATEGORY_TYPE,
      primaryKey: true,
      notNull: true,
    },
    total: {
      type: 'DECIMAL',
      notNull: true,
    },
    allocated: {
      type: 'DECIMAL',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      default: 'now()',
      notNull: true,
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      default: 'now()',
      notNull: true,
    },
  })

  pgm.addConstraint(
    Model.tableName,
    'fk_quarter_budget',
    `FOREIGN KEY(${Model.primaryKey}) REFERENCES ${QuarterBudgetModel.tableName}(${QuarterBudgetModel.primaryKey})`
  )

  pgm.addIndex(Model.tableName, ['quarter_budget_id', 'category'])
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName, { cascade: true })
  pgm.dropType(PROPOSAL_GRANT_CATEGORY_TYPE, { cascade: true })
}
