import { Project } from '../back/models/Project'
import { TransparencyVesting } from '../clients/Transparency'
import { ProjectStatus, TransparencyProjectStatus } from '../entities/Grant/types'
import {
  ProjectVestingData,
  ProposalAttributes,
  ProposalProject,
  ProposalWithProject,
} from '../entities/Proposal/types'
import { isSameAddress } from '../entities/Snapshot/utils'

import Time from './date/Time'

export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}

function toGovernanceProjectStatus(status: TransparencyProjectStatus) {
  switch (status) {
    case TransparencyProjectStatus.Pending:
      return ProjectStatus.Pending
    case TransparencyProjectStatus.InProgress:
      return ProjectStatus.InProgress
    case TransparencyProjectStatus.Finished:
      return ProjectStatus.Finished
    case TransparencyProjectStatus.Paused:
      return ProjectStatus.Paused
    case TransparencyProjectStatus.Revoked:
      return ProjectStatus.Revoked
  }
}

function getProjectVestingData(proposal: ProposalAttributes, vesting?: TransparencyVesting): ProjectVestingData {
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
    status: toGovernanceProjectStatus(status),
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

export function createProposalProject(proposal: ProposalWithProject, vesting?: TransparencyVesting): ProposalProject {
  const vestingData = getProjectVestingData(proposal, vesting)

  return {
    id: proposal.id,
    project_id: proposal.project_id,
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

export function isProjectAuthorOrCoauthor(user: string, project: Project) {
  return isSameAddress(user, project.author) || !!project.coauthors?.some((coauthor) => isSameAddress(user, coauthor))
}
