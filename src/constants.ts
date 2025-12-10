import { ChainId } from '@dcl/schemas'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { OTTERSPACE_DAO_RAFT_ID } from './entities/Snapshot/constants'

import env from './config'

export function trimOtterspaceId(rawId: string) {
  const parts = rawId.split(':')
  if (parts.length === 2) {
    return parts[1]
  }
  return ''
}

function getBooleanStringVar(variableName: string, defaultValue: boolean) {
  const enabled = env(variableName)
  if (enabled && enabled.length > 0) return enabled === 'true'
  return defaultValue
}

export function getVestingContractUrl(address: string) {
  return VESTING_DASHBOARD_URL.replace('%23', '#').concat(address.toLowerCase())
}

export const DAO_COUNCIL_ADDRESSES = (process.env.DAO_COUNCIL_ADDRESSES || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

export const GOVERNANCE_URL = process.env.GATSBY_GOVERNANCE_URL || 'https://decentraland.zone/governance'
export const GOVERNANCE_API = process.env.GATSBY_GOVERNANCE_API || ''
export const FORUM_URL = process.env.GATSBY_DISCOURSE_API || ''
export const DAO_ROLLBAR_TOKEN = process.env.DAO_ROLLBAR_TOKEN
export const DISCORD_SERVICE_ENABLED = getBooleanStringVar('DISCORD_SERVICE_ENABLED', true)
export const NOTIFICATIONS_SERVICE_ENABLED = getBooleanStringVar('NOTIFICATIONS_SERVICE_ENABLED', true)
export const DCL_NOTIFICATIONS_SERVICE_ENABLED = getBooleanStringVar('DCL_NOTIFICATIONS_SERVICE_ENABLED', true)
export const VOTES_VP_THRESHOLD = 5
export const RAFT_OWNER_PK = process.env.RAFT_OWNER_PK || ''
export const POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS || ''
export const POLYGON_RAFTS_CONTRACT_ADDRESS = process.env.POLYGON_RAFTS_CONTRACT_ADDRESS || ''
export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || ''
export const TRIMMED_OTTERSPACE_RAFT_ID = trimOtterspaceId(OTTERSPACE_DAO_RAFT_ID)
export const TOP_VOTERS_PER_MONTH = 3
export const TOP_VOTER_BADGE_IMG_URL = process.env.TOP_VOTER_BADGE_IMG_URL || ''
export const LEGISLATOR_BADGE_SPEC_CID = process.env.LEGISLATOR_BADGE_SPEC_CID || ''
export const LAND_OWNER_BADGE_SPEC_CID = process.env.LAND_OWNER_BADGE_SPEC_CID || ''
export const DISCOURSE_WEBHOOK_SECRET = process.env.DISCOURSE_WEBHOOK_SECRET || ''
export const ALCHEMY_DELEGATIONS_WEBHOOK_SECRET = process.env.ALCHEMY_DELEGATIONS_WEBHOOK_SECRET || ''
export const DEBUG_ADDRESSES = (process.env.DEBUG_ADDRESSES || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

export const SNAPSHOT_STATUS_ENABLED =
  process.env.SNAPSHOT_STATUS_ENABLED === 'true' || getBooleanStringVar('SNAPSHOT_STATUS_ENABLED', true)
export const SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE = Number(process.env.SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE || 30)
export const SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD = Number(process.env.SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD || 0.33)
export const DEFAULT_CHAIN_ID = process.env.GATSBY_DEFAULT_CHAIN_ID || String(ChainId.ETHEREUM_MAINNET)
export const PUSH_CHANNEL_ID = process.env.GATSBY_PUSH_CHANNEL_ID || ''

export const DCL_META_IMAGE_URL = 'https://decentraland.org/images/decentraland.png'
export const JOIN_DISCORD_URL = 'https://dcl.gg/discord'
export const BLOCKNATIVE_API_KEY = process.env.BLOCKNATIVE_API_KEY || ''
export const REASON_THRESHOLD = Number(process.env.GATSBY_REASON_THRESHOLD)

export const VESTING_DASHBOARD_URL = 'https://decentraland.org/vesting/%23/'
