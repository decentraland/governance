export type GrantTierAttributes = {
  type: GrantTierType
  min: number
  max: number
  status: GrantTierStatus
}

export enum GrantTierStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum GrantTierType {
  Tier1 = 'Tier 1: up to $1,500 USD in MANA, one-time payment',
  Tier2 = 'Tier 2: up to $3,000 USD in MANA, one-time payment',
  Tier3 = 'Tier 3: up to $5,000 USD in MANA, 3 months vesting (1 month cliff)',
  Tier4 = 'Tier 4: up to $60,000 USD, 6 months vesting (1 month cliff)',
  Tier5 = 'Tier 5: up to $120,000 USD, 6 months vesting (1 month cliff)',
  Tier6 = 'Tier 6: up to $240,000 USD, 6 months vesting (1 month cliff)',
  LowerTier = 'Lower Tier',
  HigherTier = 'Higher Tier',
}
