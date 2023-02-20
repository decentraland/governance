import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import filter from 'lodash/filter'
import isNil from 'lodash/isNil'

import { DclData } from '../clients/DclData'
import { isCurrentGrant } from '../entities/Grant/utils'
import ProposalModel from '../entities/Proposal/model'
import {
  GrantWithUpdateAttributes,
  ProposalAttributes,
  ProposalStatus,
  TransparencyGrant,
} from '../entities/Proposal/types'
import UpdateModel from '../entities/Updates/model'
import { IndexedUpdate, UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates } from '../entities/Updates/utils'
import { formatError } from '../helpers'

export class GrantsService {
  public static async getGrants() {
    const grants = await DclData.get().getGrants()
    const enactedGrants = filter(grants, (item) => item.status === ProposalStatus.Enacted)

    const current: GrantWithUpdateAttributes[] = []
    const past: GrantWithUpdateAttributes[] = []

    await Promise.all(
      enactedGrants.map(async (grant) => {
        if (!grant.vesting_address && !grant.enacting_tx) {
          return
        }

        try {
          const proposal = await ProposalModel.findOne<ProposalAttributes>(grant.id)

          if (!proposal) {
            throw new Error('Proposal not found')
          }

          const newGrant: TransparencyGrant = {
            id: grant.id,
            size: grant.size,
            configuration: {
              category: grant.category,
              tier: grant.tier,
            },
            status: grant.vesting_status,
            user: grant.user,
            title: grant.title,
            token: grant.token,
            created_at: Time(proposal.created_at).unix(),
            enacted_at: grant.tx_date ? Time(grant.tx_date).unix() : Time(grant.vesting_start_at).unix(),
          }

          if (grant.tx_date) {
            Object.assign(newGrant, {
              enacting_tx: grant.enacting_tx,
              tx_amount: grant.tx_amount,
            })
          } else {
            const { vesting_total_amount, vesting_released, vesting_releasable } = grant

            if (isNil(vesting_total_amount) || isNil(vesting_released) || isNil(vesting_releasable)) {
              throw new Error('Missing vesting data')
            }

            Object.assign(newGrant, {
              contract: {
                vesting_total_amount: Math.round(vesting_total_amount),
                vestedAmount: Math.round(vesting_released + vesting_releasable),
                releasable: Math.round(vesting_releasable),
                released: Math.round(vesting_released),
                start_at: Time(grant.vesting_start_at).unix(),
                finish_at: Time(grant.vesting_finish_at).unix(),
              },
            })
          }

          try {
            const update = await this.getGrantLatestUpdate(grant.id)
            const grantWithUpdate: GrantWithUpdateAttributes = {
              ...newGrant,
              update,
              update_timestamp: update?.completion_date ? Time(update?.completion_date).unix() : 0,
            }
            return isCurrentGrant(newGrant.status) ? current.push(grantWithUpdate) : past.push(grantWithUpdate)
          } catch (error) {
            logger.error(`Failed to fetch grant update data from proposal ${grant.id}`, formatError(error as Error))
          }
        } catch (error) {
          logger.error(`Failed to fetch proposal ${grant.id}`, formatError(error as Error))
        }
      })
    )

    return {
      current,
      past,
      total: grants.length,
    }
  }

  private static async getGrantLatestUpdate(proposalId: string): Promise<IndexedUpdate | null> {
    const updates = await UpdateModel.find<UpdateAttributes>({ proposal_id: proposalId }, {
      created_at: 'desc',
    } as never)
    if (!updates || updates.length === 0) {
      return null
    }

    const publicUpdates = getPublicUpdates(updates)
    const currentUpdate = publicUpdates[0]
    if (!currentUpdate) {
      return null
    }

    return { ...currentUpdate, index: publicUpdates.length }
  }
}
