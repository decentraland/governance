import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import Model from "../models/Financial"
import UpdateModel from "../entities/Updates/model"
import { FinancialRecordCateogry } from "../entities/Updates/types"

const CATEGORY_TYPE = 'financial_category_type'

export async function up(pgm: MigrationBuilder): Promise<void> {
  const columns: ColumnDefinitions = {
    id: {
      type: 'SERIAL',
      primaryKey: true,
      notNull: true,
    },
    update_id: {
      type: 'TEXT',
      notNull: true,
    },
    category: {
      type: CATEGORY_TYPE,
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: true,
    },
    amount: {
      type: 'DECIMAL',
      notNull: true,
    },
    token: {
      type: 'TEXT',
      notNull: true,
    },
    receiver: {
      type: 'TEXT',
      notNull: true,
    },
    link: {
      type: 'TEXT',
      notNull: true,
    },
  }

  pgm.createType(CATEGORY_TYPE, Object.values(FinancialRecordCateogry))
  pgm.createTable(Model.tableName, columns)
  pgm.addConstraint(
    Model.tableName,
    'fk_update',
    `FOREIGN KEY(update_id) REFERENCES ${UpdateModel.tableName}(${UpdateModel.primaryKey})`
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
  pgm.dropType(CATEGORY_TYPE, { cascade: true })
}