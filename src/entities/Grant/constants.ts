import { GrantTierAttributes, GrantTierStatus, GrantTierType } from './types'

export const GRANT_PROPOSAL_DURATION_IN_SECONDS = 1209600

export const TIERS: GrantTierAttributes[] = [
  { type: GrantTierType.LowerTier, status: GrantTierStatus.Active, min: 1, max: 25000 },
  { type: GrantTierType.HigherTier, status: GrantTierStatus.Active, min: 25001, max: 250000 },
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
