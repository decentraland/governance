import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { FinancialAttributes, FinancialAttributesExtended } from '../back/models/Financial'
import Model from '../back/models/Financial'
import { FinancialRecord } from '../entities/Updates/types'
import { ErrorCategory } from '../utils/errorCategories'

import { ErrorService } from './ErrorService'

export class FinancialService {
  public static async getAll(page_number: number, page_size: number): Promise<FinancialAttributesExtended[]> {
    try {
      return await Model.getAllRecords(page_number, page_size)
    } catch (error) {
      ErrorService.report('Error fetching financial records', {
        page_number,
        page_size,
        error,
        category: ErrorCategory.Financial,
      })
      return []
    }
  }

  public static async getRecordsByUpdateId(update_id: string): Promise<FinancialRecord[] | null> {
    try {
      return await Model.getRecords(update_id)
    } catch (error) {
      ErrorService.report('Error fetching financial records', { update_id, error, category: ErrorCategory.Financial })
      return null
    }
  }

  public static async createRecords(update_id: string, records: FinancialRecord[]): Promise<FinancialAttributes[]> {
    try {
      this.deleteRecordsByUpdateId(update_id)
      return await Model.createRecords(update_id, records)
    } catch (error) {
      const msg = 'Error inserting financial records'
      ErrorService.report(msg, {
        update_id,
        error,
        category: ErrorCategory.Financial,
      })
      throw new RequestError(msg, RequestError.InternalServerError)
    }
  }

  public static async deleteRecordsByUpdateId(update_id: string): Promise<void> {
    try {
      await Model.deleteRecords(update_id)
    } catch (error) {
      ErrorService.report('Error deleting financial records', { update_id, error, category: ErrorCategory.Financial })
    }
  }
}
