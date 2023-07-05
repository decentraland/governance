import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'

import { VestingDates } from '../../clients/VestingData'
import Time from '../../utils/date/Time'
import { VestingStartDate } from '../Grant/types'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'proposal_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingUpdates(
    proposalId: string,
    vestingDates: VestingDates,
    preferredVestingStartDate: VestingStartDate
  ) {
    if (proposalId.length < 0) throw new Error('Unable to create updates for empty proposal id')

    const now = new Date()
    const updatesQuantity = vestingDates.durationInMonths
    const firstUpdateStartingDate = this.getFirstUpdateStartingDate(
      vestingDates.vestingStartAt,
      preferredVestingStartDate
    )

    await UpdateModel.delete<UpdateAttributes>({ proposal_id: proposalId, status: UpdateStatus.Pending })

    const updates = Array.from(Array(updatesQuantity), (_, index) => {
      const update: UpdateAttributes = {
        id: uuid(),
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

  public static getFirstUpdateStartingDate(vestingStartDate: string, preferredPaymentDate: VestingStartDate) {
    return Time.utc(vestingStartDate)
      .set('date', preferredPaymentDate === VestingStartDate.First ? 1 : 15)
      .startOf('day')
  }

  public static getDueDate(startingDate: Time.Dayjs, index: number) {
    return startingDate.add(1 + index, 'months').toDate()
  }

  static async createUpdate(
    update: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>
  ) {
    const now = new Date()

    return await this.create({
      id: uuid(),
      status: UpdateStatus.Done,
      due_date: undefined,
      completion_date: now,
      created_at: now,
      updated_at: now,
      ...update,
    })
  }
}
