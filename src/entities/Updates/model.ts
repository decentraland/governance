import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import { ProposalGrantTier } from '../Proposal/types'
import { UpdateAttributes, UpdateStatus } from './types'

const UpdateCount: { [key: string]: number } = {
  [ProposalGrantTier.Tier1]: 1,
  [ProposalGrantTier.Tier2]: 1,
  [ProposalGrantTier.Tier3]: 3,
  [ProposalGrantTier.Tier4]: 6,
  [ProposalGrantTier.Tier5]: 6,
  [ProposalGrantTier.Tier6]: 6,
}

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'proposal_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingUpdates(proposalId: string, tier: ProposalGrantTier) {
    const updatesQuantity = UpdateCount[tier]
    const now = new Date()

    if (updatesQuantity === 1) {
      return null
    }

    return Array.from(Array(updatesQuantity), async (_, index) => {
      const update: UpdateAttributes = {
        id: uuid(),
        proposal_id: proposalId,
        status: UpdateStatus.Pending,
        due_date: new Date(new Date().setMonth(now.getMonth() + index + 1)),
        created_at: now,
        updated_at: now,
      }

      await this.create(update)
    })
  }

  static async createUpdate(
    update: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>
  ) {
    const now = new Date()

    await this.create({
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
