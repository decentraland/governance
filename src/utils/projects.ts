import { TransparencyVesting } from '../clients/Transparency'
import { Vesting } from '../clients/VestingData'
import { ProjectStatus, VestingStatus } from '../entities/Grant/types'
import { ProjectFunding, ProposalAttributes, ProposalProject, ProposalWithProject } from '../entities/Proposal/types'
import { CLIFF_PERIOD_IN_DAYS } from '../entities/Proposal/utils'

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

function getFunding(proposal: ProposalAttributes, transparencyVesting?: TransparencyVesting): ProjectFunding {
  if (proposal.enacting_tx) {
    // one time payment
    return {
      enacted_at: proposal.updated_at.toISOString(),
      one_time_payment: {
        enacting_tx: proposal.enacting_tx,
      },
    }
  }

  if (!transparencyVesting) {
    return {}
  }

  return {
    enacted_at: transparencyVesting.vesting_start_at,
    vesting: toVesting(transparencyVesting),
  }
}

function getProjectStatus(proposal: ProposalAttributes, vesting?: TransparencyVesting) {
  const legacyCondition = !vesting && proposal.enacted_description
  if (proposal.enacting_tx || legacyCondition) {
    return ProjectStatus.Finished
  }

  if (!vesting) {
    return ProjectStatus.Pending
  }

  const { vesting_status } = vesting

  return toGovernanceProjectStatus(vesting_status)
}

export function createProposalProject(proposal: ProposalWithProject, vesting?: TransparencyVesting): ProposalProject {
  const funding = getFunding(proposal, vesting)
  const status = getProjectStatus(proposal, vesting)

  return {
    id: proposal.id,
    project_id: proposal.project_id,
    status,
    title: proposal.title,
    user: proposal.user,
    personnel: proposal.personnel,
    coAuthors: proposal.coAuthors,
    about: proposal.configuration.abstract,
    type: proposal.type,
    size: proposal.configuration.size || proposal.configuration.funding,
    created_at: proposal.created_at.getTime(),
    updated_at: proposal.updated_at.getTime(),
    configuration: {
      category: proposal.configuration.category || proposal.type,
      tier: proposal.configuration.tier,
    },
    funding,
  }
}

//TODO: stop using transparency vestings
export function toVesting(transparencyVesting: TransparencyVesting): Vesting {
  const {
    token,
    vesting_start_at,
    vesting_finish_at,
    vesting_total_amount,
    vesting_released,
    vesting_releasable,
    vesting_status,
    vesting_address,
  } = transparencyVesting

  const vesting: Vesting = {
    token,
    address: vesting_address,
    start_at: vesting_start_at,
    finish_at: vesting_finish_at,
    releasable: Math.round(vesting_releasable),
    released: Math.round(vesting_released),
    total: Math.round(vesting_total_amount),
    vested: Math.round(vesting_released + vesting_releasable),
    status: vesting_status,
    cliff: Time.unix(Number(vesting_start_at)).add(CLIFF_PERIOD_IN_DAYS, 'day').getTime().toString(),
    vestedPerPeriod: [],
  }

  return vesting
}
