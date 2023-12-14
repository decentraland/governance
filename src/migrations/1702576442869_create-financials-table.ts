import { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate"
import Model from "../back/models/financial"
import UpdateModel from "../entities/Updates/model"

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
    concept: {
      type: 'TEXT',
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
    token_type: {
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

  pgm.createTable(Model.tableName, columns)
  pgm.addConstraint(
    Model.tableName,
    'fk_update',
    `FOREIGN KEY(update_id) REFERENCES ${UpdateModel.tableName}(${UpdateModel.primaryKey})`
  )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable(Model.tableName)
}