import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

import {
  GRANT_PROPOSAL_MAX_BUDGET,
  GRANT_PROPOSAL_MIN_BUDGET,
  GrantTierAttributes,
  GrantTierStatus,
  GrantTierType,
} from './types'

export const GRANT_PROPOSAL_DURATION_IN_SECONDS = env('GATSBY_GRANT_PROPOSAL_DURATION_IN_SECONDS', '1209600')
export const MAX_LOWER_TIER_GRANT_FUNDING = 20000
export const BUDGETING_START_DATE = Time.utc('2023-01-01 00:00:00Z').toDate()

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
