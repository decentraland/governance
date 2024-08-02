export type SubgraphVesting = {
  id: string
  version: number
  duration: string
  cliff: string
  beneficiary: string
  revoked: boolean
  revocable: boolean
  released: string
  start: string
  periodDuration: string
  vestedPerPeriod: string[]
  paused: boolean
  pausable: boolean
  stop: string
  linear: boolean
  token: string
  owner: string
  total: string
  releaseLogs: SubgraphReleaseLog[]
  pausedLogs: SubgraphPausedLog[]
  revokeTimestamp: bigint
}

type SubgraphReleaseLog = {
  id: string
  timestamp: string
  amount: string
}

type SubgraphPausedLog = {
  id: string
  timestamp: string
  eventType: string
}
