import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { NewGrantCategory } from '../../entities/Grant/types'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { FinancialRecord } from '../../entities/Updates/types'

export type FinancialAttributes = {
  id: number
  update_id: string
} & FinancialRecord

export type FinancialAttributesExtended = FinancialAttributes & {
  proposal_id: ProposalAttributes['id']
  proposal_type: ProposalAttributes['type']
  proposal_category: NewGrantCategory | null
}

export default class FinancialModel extends Model<FinancialAttributes> {
  static tableName = 'financial_records'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getAllRecords(page_number: number, page_size: number): Promise<FinancialAttributesExtended[]> {
    if (page_number < 0 || page_size < 0) throw new Error('Invalid page_number or page_size')
    if (page_size > 100) throw new Error('page_size must be less or equal than 100')

    const query = SQL`
    WITH ordered_records AS (
      SELECT fr.id, fr.update_id, fr.category, fr.description, fr.amount,
            fr.token, fr.receiver, fr.link, pu.proposal_id,
            p.configuration ->> 'category' AS proposal_category, p.type AS proposal_type
      FROM ${table(this)} fr
      JOIN ${table(UpdateModel)} pu ON fr.update_id = pu.id
      JOIN ${table(ProposalModel)} p ON pu.proposal_id = p.id
      ORDER BY pu.due_date, fr.id
    )
    
    SELECT id, update_id, proposal_id, proposal_type, proposal_category, 
           category, description, amount, token, receiver, link
    FROM ordered_records
        LIMIT ${page_size}
        OFFSET ${page_number * page_size};
    `

    const result = await this.namedQuery<FinancialAttributesExtended>('get_all_financial_records', query)

    return result
  }

  static async getRecords(update_id: string): Promise<FinancialRecord[]> {
    const query = SQL`
        SELECT category, description, token, amount, receiver, link
        FROM ${table(this)}
        WHERE 
          "update_id" = ${update_id}
    `

    const result = await this.namedQuery<FinancialRecord>('get_financial_records', query)

    return result.map((record) => ({ ...record, amount: parseFloat(record.amount.toString()) }))
  }

  static async createRecords(update_id: string, records: FinancialRecord[]): Promise<FinancialAttributes[]> {
    const query = SQL`
        INSERT INTO ${table(this)} ("update_id", "category", "description", "amount", "token", "receiver", "link")
        VALUES ${join(
          records.map(
            (record) =>
              SQL`(${update_id}, ${record.category}, ${record.description}, ${record.amount}, UPPER(${record.token}), ${record.receiver}, ${record.link})`
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
