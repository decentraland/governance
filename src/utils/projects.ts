import { TransparencyVesting } from '../clients/Transparency'
import { ProjectStatus, VestingStatus } from '../entities/Grant/types'
import {
  ProjectVestingData,
  ProposalAttributes,
  ProposalProject,
  ProposalWithProject,
} from '../entities/Proposal/types'

import Time from './date/Time'

export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}

export function toGovernanceProjectStatus(status: VestingStatus) {
  switch (status) {
    case VestingStatus.Pending:
      return ProjectStatus.Pending
    case VestingStatus.InProgress:
      return ProjectStatus.InProgress
    case VestingStatus.Finished:
      return ProjectStatus.Finished
    case VestingStatus.Paused:
      return ProjectStatus.Paused
    case VestingStatus.Revoked:
      return ProjectStatus.Revoked
  }
}

function getProjectVestingData(proposal: ProposalAttributes, vesting?: TransparencyVesting): ProjectVestingData {
  if (proposal.enacting_tx) {
    return {
      enacting_tx: proposal.enacting_tx,
      enacted_at: Time(proposal.updated_at).unix(),
    }
  }

  if (!vesting) {
    return {}
  }

  const { token, vesting_start_at, vesting_finish_at, vesting_total_amount, vesting_released, vesting_releasable } =
    vesting

  return {
    token,
    enacted_at: Time(vesting_start_at).unix(),
    contract: {
      vesting_total_amount: Math.round(vesting_total_amount),
      vested_amount: Math.round(vesting_released + vesting_releasable),
      releasable: Math.round(vesting_releasable),
      released: Math.round(vesting_released),
      start_at: Time(vesting_start_at).unix(),
      finish_at: Time(vesting_finish_at).unix(),
    },
  }
}

function getProjectStatus(proposal: ProposalAttributes, vesting?: TransparencyVesting) {
  if (proposal.enacting_tx) {
    return ProjectStatus.Finished
  }

  if (!vesting) {
    return ProjectStatus.Pending
  }

  const { vesting_status } = vesting

  return toGovernanceProjectStatus(vesting_status)
}

export function createProposalProject(proposal: ProposalWithProject, vesting?: TransparencyVesting): ProposalProject {
  const vestingData = getProjectVestingData(proposal, vesting)
  const status = getProjectStatus(proposal, vesting)

  return {
    id: proposal.id,
    project_id: proposal.project_id,
    status,
    title: proposal.title,
    user: proposal.user,
    about: proposal.configuration.abstract,
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
