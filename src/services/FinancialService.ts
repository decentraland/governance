import { FinancialAttributes } from '../back/models/Financial'
import Model from '../back/models/Financial'
import { FinancialUpdateRecord } from '../entities/Updates/types'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'

import { ErrorService } from './ErrorService'

export class FinancialService {
  public static async getRecords(update_id: string): Promise<FinancialUpdateRecord[] | null> {
    try {
      return await Model.getRecords(update_id)
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error fetching financial records', { update_id, error, category: ErrorCategory.Financial })
      } else {
        console.error(error)
      }
      return null
    }
  }

  public static async insertRecords(
    update_id: string,
    records: FinancialUpdateRecord[]
  ): Promise<FinancialAttributes[] | null> {
    try {
      this.deleteRecords(update_id)
      return await Model.insertRecords(update_id, records)
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error inserting financial records', {
          update_id,
          error,
          category: ErrorCategory.Financial,
        })
      } else {
        console.error(error)
      }
      return null
    }
  }

  public static async deleteRecords(update_id: string): Promise<void> {
    try {
      await Model.deleteRecords(update_id)
    } catch (error) {
      if (isProdEnv()) {
        ErrorService.report('Error deleting financial records', { update_id, error, category: ErrorCategory.Financial })
      } else {
        console.error(error)
      }
    }
  }
}
