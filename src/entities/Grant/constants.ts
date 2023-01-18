import { ProposalGrantCategory } from '../Proposal/types'

import { GrantTierAttributes, GrantTierStatus, GrantTierType } from './types'

export const GRANT_PROPOSAL_DURATION_IN_SECONDS = 1209600
export const GRANT_PROPOSAL_MIN_BUDGET = 100
export const GRANT_PROPOSAL_MAX_BUDGET = 240000
export const MAX_LOWER_TIER_GRANT_FUNDING = 20000

export const MIN_PROJECT_DURATION = 1
export const MAX_PROJECT_DURATION = 12
export const MIN_LOW_TIER_PROJECT_DURATION = MIN_PROJECT_DURATION
export const MAX_LOW_TIER_PROJECT_DURATION = 6
export const MIN_HIGH_TIER_PROJECT_DURATION = 3
export const MAX_HIGH_TIER_PROJECT_DURATION = MAX_PROJECT_DURATION

// TODO: This object should be generated dynamically in backend, calculating budget available from passed/enacted proposals
export const BUDGET = {
  total: 1501500,
  categories: {
    [ProposalGrantCategory.Platform]: {
      total: 600600,
      available: 600600,
    },
    [ProposalGrantCategory.InWorldContent]: {
      total: 300300,
      available: 300300,
    },
    [ProposalGrantCategory.CoreUnit]: {
      total: 225225,
      available: 225225,
    },
    [ProposalGrantCategory.Sponsorship]: {
      total: 150150,
      available: 150150,
    },
    [ProposalGrantCategory.Accelerator]: {
      total: 75075,
      available: 75075,
    },
    [ProposalGrantCategory.SocialMediaContent]: {
      total: 75075,
      available: 75075,
    },
    [ProposalGrantCategory.Documentation]: {
      total: 45045,
      available: 45045,
    },
    // TODO: Remove old. Done this to fix typing
    [ProposalGrantCategory.PlatformContributor]: {
      total: 0,
      available: 0,
    },
    [ProposalGrantCategory.Community]: {
      total: 0,
      available: 0,
    },
    [ProposalGrantCategory.Gaming]: {
      total: 0,
      available: 0,
    },
    [ProposalGrantCategory.ContentCreator]: {
      total: 0,
      available: 0,
    },
  },
}

export const TIERS: GrantTierAttributes[] = [
  {
    type: GrantTierType.LowerTier,
    status: GrantTierStatus.Active,
    min: GRANT_PROPOSAL_MIN_BUDGET,
    max: MAX_LOWER_TIER_GRANT_FUNDING,
  },
  {
    type: GrantTierType.HigherTier,
    status: GrantTierStatus.Active,
    min: MAX_LOWER_TIER_GRANT_FUNDING,
    max: GRANT_PROPOSAL_MAX_BUDGET,
  },
  {
    type: GrantTierType.Tier1,
    status: GrantTierStatus.Inactive,
    min: 1,
    max: 1500,
  },
  {
    type: GrantTierType.Tier2,
    status: GrantTierStatus.Inactive,
    min: 1501,
    max: 3000,
  },
  {
    type: GrantTierType.Tier3,
    status: GrantTierStatus.Inactive,
    min: 3001,
    max: 5000,
  },
  {
    type: GrantTierType.Tier4,
    status: GrantTierStatus.Inactive,
    min: 5001,
    max: 60000,
  },
  {
    type: GrantTierType.Tier5,
    status: GrantTierStatus.Inactive,
    min: 60001,
    max: 120000,
  },
  {
    type: GrantTierType.Tier6,
    status: GrantTierStatus.Inactive,
    min: 120001,
    max: 240000,
  },
]
