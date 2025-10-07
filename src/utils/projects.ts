import { Vesting, VestingWithLogs } from '../clients/VestingData'
import { ProjectStatus, VestingStatus } from '../entities/Grant/types'
import { ProjectFunding } from '../entities/Proposal/types'
import { ProjectQueryResult, UserProject } from '../models/Project'

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

export function getProjectFunding(
  project: ProjectQueryResult | UserProject,
  vesting: Vesting | undefined
): ProjectFunding {
  if (project.enacting_tx) {
    // one time payment
    return {
      enacted_at: project.proposal_updated_at.toISOString(),
      one_time_payment: {
        enacting_tx: project.enacting_tx,
      },
    }
  }

  if (!vesting) {
    return {}
  }
  return {
    enacted_at: vesting.start_at,
    vesting,
  }
}

export function getProjectStatus(
  project: ProjectQueryResult | UserProject,
  vesting: VestingWithLogs | undefined
): ProjectStatus {
  const legacyCondition = project.enacting_tx || (!vesting && project.enacted_description)
  if (legacyCondition) {
    return ProjectStatus.Finished
  }
  if (!vesting) {
    return project.status ?? ProjectStatus.Pending
  }
  return toGovernanceProjectStatus(vesting.status)
}
