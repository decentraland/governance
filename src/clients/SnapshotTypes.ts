export type SnapshotQueryResponse<T> = { data: T }
export type SnapshotConfig = {
  name: string
  network: string
  version: string
  tag: string
  relayer: string
}
export type SnapshotStrategy = {
  name: string
  params: {
    symbol: string
    address: string
    decimals: number
  }
}
export type SnapshotSpace = {
  id: string
  network: string
  strategies: SnapshotStrategy[]
}
export type SnapshotVoteResponse = SnapshotQueryResponse<{ votes: SnapshotVote[] }>
export type SnapshotVote = {
  id?: string
  voter: string
  created: number
  vp?: number
  vp_by_strategy?: number[]
  choice: number
  metadata?: Record<string, unknown>
  reason?: string
  proposal?: {
    id: string
    title?: string
    choices: string[]
    scores?: number[]
    state?: string | 'active' | 'closed'
  }
}
export type Delegation = {
  delegator: string
  delegate: string
  space: string
}
export type DelegationResult = {
  delegatedTo: Delegation[]
  delegatedFrom: Delegation[]
}
export const EMPTY_DELEGATION: DelegationResult = {
  delegatedTo: [],
  delegatedFrom: [],
}
export type ScoreDetail = {
  ownVp: number
  delegatedVp: number
  totalVp: number
}
export type DetailedScores = Record<string, ScoreDetail>
export type SnapshotProposalsResponse = SnapshotQueryResponse<{ proposals: Partial<SnapshotProposal>[] }>
export type SnapshotProposalResponse = SnapshotQueryResponse<{ proposal: Partial<SnapshotProposal> }>

export type SnapshotProposal = {
  id: string
  ipfs: string
  author: string
  created: number
  type: string
  title: string
  body: string
  choices: string[]
  start: number
  end: number
  snapshot: string
  state: string
  link: string
  scores: number[]
  scores_by_strategy: number[]
  scores_state: string
  scores_total: number
  scores_updated: number
  votes: number
  space: SnapshotSpace
  strategies?: SnapshotStrategy[]
  discussion: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: any
}

export type SnapshotProposalContent = Omit<
  SnapshotProposal,
  | 'scores'
  | 'scores_by_strategy'
  | 'scores_state'
  | 'scores_total'
  | 'scores_updated'
  | 'votes'
  | 'strategies'
  | 'state'
  | 'link'
>

export enum SnapshotScoresState {
  Pending = 'pending',
  Final = 'final',
}

export type SnapshotVpResponse = SnapshotQueryResponse<{
  vp: {
    vp: number
    vp_by_strategy: number[]
  } | null
}>
export type VpDistribution = {
  total: number
  own: number
  wMana: number
  land: number
  estate: number
  mana: number
  names: number
  delegated: number
  l1Wearables: number
  rental: number
}

export enum StrategyOrder {
  WrappedMana,
  Land,
  Estate,
  Mana,
  Names,
  Delegation,
  L1Wearables,
  Rental,
}

export enum ServiceHealth {
  Normal = 'normal',
  Failing = 'failing',
  Unknown = 'unknown',
}
export type ServiceStatus = { health: ServiceHealth; responseTime: number; errorRate: number }
export type SnapshotStatus = { scoresStatus: ServiceStatus; graphQlStatus: ServiceStatus }
export const UNKNOWN_STATUS = { health: ServiceHealth.Unknown, responseTime: 0, errorRate: 0 }
