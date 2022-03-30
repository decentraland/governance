import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import { ProposalGrantTier } from '../Proposal/types'
import { UpdateAttributes, UpdateStatus } from './types'

const UpdateCount: { [key: string]: number } = {
  [ProposalGrantTier.Tier1]: 1,
  [ProposalGrantTier.Tier2]: 1,
  [ProposalGrantTier.Tier3]: 1,
  [ProposalGrantTier.Tier4]: 6,
  [ProposalGrantTier.Tier5]: 6,
  [ProposalGrantTier.Tier6]: 6,
}

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'proposal_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createUpdates(proposalId: string, tier: ProposalGrantTier) {
    const updatesQuantity = UpdateCount[tier]
    const now = new Date()

    return Array.from(Array(updatesQuantity), async (_, index) => {
      const due_date = updatesQuantity === 1 ? undefined : new Date(new Date().setMonth(now.getMonth() + index + 1))

      const update: UpdateAttributes = {
        id: uuid(),
        proposal_id: proposalId,
        status: UpdateStatus.Pending,
        due_date,
        created_at: now,
        updated_at: now,
      }

      await this.create(update)
    })
  }

  static async skipRemainingUpdates(proposalId: string) {
    const query = SQL`
      UPDATE ${table(UpdateModel)}
      SET
        "status" = ${UpdateStatus.Skipped},
        "updated_at" = ${new Date}
      WHERE
        "status" = ${UpdateStatus.Pending}
        AND "proposal_id" = ${proposalId}
    `

    return this.rowCount(query)
  }
}
