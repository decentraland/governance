import { TransparencyVesting } from '../clients/Transparency'
import { ProjectStatus } from '../entities/Grant/types'
import { ProposalAttributes, ProposalProject } from '../entities/Proposal/types'

import Time from './date/Time'

export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}

function getProjectVestingData(proposal: ProposalAttributes, vesting: TransparencyVesting) {
  if (proposal.enacting_tx) {
    return {
      status: ProjectStatus.Finished,
      enacting_tx: proposal.enacting_tx,
      enacted_at: Time(proposal.updated_at).unix(),
    }
  }

  if (!vesting) {
    return {
      status: ProjectStatus.Pending,
    }
  }

  const {
    vesting_status: status,
    token,
    vesting_start_at,
    vesting_finish_at,
    vesting_total_amount,
    vesting_released,
    vesting_releasable,
  } = vesting

  return {
    status,
    token,
    enacted_at: Time(vesting_start_at).unix(),
    contract: {
      vesting_total_amount: Math.round(vesting_total_amount),
      vestedAmount: Math.round(vesting_released + vesting_releasable),
      releasable: Math.round(vesting_releasable),
      released: Math.round(vesting_released),
      start_at: Time(vesting_start_at).unix(),
      finish_at: Time(vesting_finish_at).unix(),
    },
  }
}

export function createProject(proposal: ProposalAttributes, vesting?: TransparencyVesting): ProposalProject {
  const vestingData = vesting ? getProjectVestingData(proposal, vesting) : {}

  return {
    id: proposal.id,
    title: proposal.title,
    user: proposal.user,
    type: proposal.type,
    size: proposal.configuration.size || proposal.configuration.funding,
    created_at: proposal.created_at.getTime(),
    configuration: {
      category: proposal.configuration.category || proposal.type,
      tier: proposal.configuration.tier,
    },
    ...vestingData,
  }
}
