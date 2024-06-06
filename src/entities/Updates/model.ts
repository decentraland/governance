import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import ProjectModel from '../../back/models/Project'
import { type Vesting } from '../../clients/VestingData'
import Time from '../../utils/date/Time'
import { getMonthsBetweenDates } from '../../utils/date/getMonthsBetweenDates'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'project_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingUpdates(proposalId: string, vestingContractData: Vesting) {
    if (proposalId.length < 0) throw new Error('Unable to create updates for empty proposal id')

    const now = new Date()
    const updatesQuantity = this.getAmountOfUpdates(vestingContractData)
    const firstUpdateStartingDate = Time.utc(vestingContractData.start_at).startOf('day')

    await UpdateModel.delete<UpdateAttributes>({ proposal_id: proposalId, status: UpdateStatus.Pending })

    const updates = Array.from(Array(updatesQuantity), (_, index) => {
      const update: UpdateAttributes = {
        id: crypto.randomUUID(),
        proposal_id: proposalId,
        status: UpdateStatus.Pending,
        due_date: this.getDueDate(firstUpdateStartingDate, index),
        created_at: now,
        updated_at: now,
      }

      return update
    })
    return await this.createMany(updates)
  }

  public static getAmountOfUpdates(vestingDates: Vesting) {
    const exactDuration = getMonthsBetweenDates(new Date(vestingDates.start_at), new Date(vestingDates.finish_at))
    return exactDuration.months + (exactDuration.extraDays > 0 ? 1 : 0)
  }

  public static getDueDate(startingDate: Time.Dayjs, index: number) {
    return startingDate.add(1 + index, 'months').toDate()
  }

  static async createUpdate(
    update: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>
  ): Promise<UpdateAttributes> {
    const now = new Date()

    return await this.create({
      id: crypto.randomUUID(),
      status: UpdateStatus.Done,
      due_date: undefined,
      completion_date: now,
      created_at: now,
      updated_at: now,
      ...update,
    })
  }

  static async setProjectIds() {
    const query = SQL`
    UPDATE ${table(this)} pu
    SET project_id = p.id
    FROM ${table(ProjectModel)} p
    WHERE pu.proposal_id = p.proposal_id
    `

    return await this.namedQuery('set_project_ids', query)
  }
}
