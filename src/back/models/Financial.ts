import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { UpdateFinancialRecord } from '../../entities/Updates/types'

export type FinancialAttributes = {
  id: number
  update_id: string
} & UpdateFinancialRecord

export default class FinancialModel extends Model<FinancialAttributes> {
  static tableName = 'financial_records'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getRecords(update_id: string): Promise<UpdateFinancialRecord[]> {
    const query = SQL`
        SELECT concept, description, amount, token_type, receiver, link
        FROM ${table(this)}
        WHERE 
          "update_id" = ${update_id}
    `

    const result = await this.namedQuery<UpdateFinancialRecord>('get_financial_records', query)

    return result.map((record) => ({ ...record, amount: parseFloat(record.amount.toString()) }))
  }

  static async insertRecords(update_id: string, records: UpdateFinancialRecord[]): Promise<FinancialAttributes[]> {
    const query = SQL`
        INSERT INTO ${table(this)} ("update_id", "concept", "description", "amount", "token_type", "receiver", "link")
        VALUES ${join(
          records.map(
            (record) =>
              SQL`(${update_id}, LOWER(${record.concept}), ${record.description}, ${record.amount}, ${record.token_type}, ${record.receiver}, ${record.link})`
          ),
          SQL`,`
        )}
        RETURNING *
    `
    const result = await this.namedQuery<FinancialAttributes>('insert_financial_records', query)

    return result
  }

  static async deleteRecords(update_id: string): Promise<void> {
    const query = SQL`
        DELETE FROM ${table(this)}
        WHERE 
          "update_id" = ${update_id}
    `

    await this.namedQuery('delete_financial_records', query)
  }
}
