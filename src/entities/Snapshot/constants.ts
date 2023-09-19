import { clientEnv } from '../../utils/clientEnv'

// Backend-only constants
export const SNAPSHOT_PRIVATE_KEY = process.env.SNAPSHOT_PRIVATE_KEY || ''
export const SNAPSHOT_API_KEY = process.env.SNAPSHOT_API_KEY || ''
export const GATSBY_SNAPSHOT_API = process.env.GATSBY_SNAPSHOT_API || ''
export const OTTERSPACE_QUERY_ENDPOINT = process.env.OTTERSPACE_QUERY_ENDPOINT || ''
export const OTTERSPACE_DAO_RAFT_ID = process.env.OTTERSPACE_DAO_RAFT_ID || ''

// Shared frontend and backend constants
export const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || clientEnv('GATSBY_SNAPSHOT_SPACE') || ''
export const SNAPSHOT_ADDRESS = process.env.GATSBY_SNAPSHOT_ADDRESS || clientEnv('GATSBY_SNAPSHOT_ADDRESS') || ''
export const SNAPSHOT_DURATION = Number(
  process.env.GATSBY_SNAPSHOT_DURATION || clientEnv('GATSBY_SNAPSHOT_DURATION') || ''
)
export const SNAPSHOT_URL = process.env.GATSBY_SNAPSHOT_URL || clientEnv('GATSBY_SNAPSHOT_URL') || ''
export const SNAPSHOT_QUERY_ENDPOINT =
  process.env.GATSBY_SNAPSHOT_QUERY_ENDPOINT || clientEnv('GATSBY_SNAPSHOT_QUERY_ENDPOINT') || ''
export const SNAPSHOT_API = process.env.GATSBY_SNAPSHOT_API || clientEnv('GATSBY_SNAPSHOT_API') || ''

// Frontend-only constants
export const SNAPSHOT_DELEGATION_URL = `https://snapshot.org/#/delegate/${SNAPSHOT_SPACE}`
export const SNAPSHOT_DELEGATE_CONTRACT_ADDRESS = clientEnv('GATSBY_SNAPSHOT_DELEGATE_CONTRACT_ADDRESS')
