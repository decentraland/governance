/* eslint-disable @typescript-eslint/naming-convention */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate'

import { NewGrantCategory } from '../entities/Grant/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import Model from '../entities/QuarterCategoryBudget/model'

export const shorthands: ColumnDefinitions | undefined = undefined

const NEW_GRANT_CATEGORY_TYPE = 'new_grant_category_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType(NEW_GRANT_CATEGORY_TYPE, Object.values(NewGrantCategory))

  pgm.createTable(Model.tableName, {
    quarter_budget_id: {
      type: 'TEXT',
      primaryKey: true,
      notNull: true,
    },
    category: {
      type: NEW_GRANT_CATEGORY_TYPE,
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
  pgm.dropTable(Model.tableName, { cascade: false })
  pgm.dropType(NEW_GRANT_CATEGORY_TYPE, { cascade: true })
}
