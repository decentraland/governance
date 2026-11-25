import { ChainId } from '@dcl/schemas'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import env from './config'

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
// Forum categories whose new topics are announced in the governance discord channel. Defaults to
// Governance and DCL Regenesis Labs; a subcategory is only covered when it is listed itself, and an
// empty value turns the announcements off.
export const DISCORD_FORUM_TOPIC_CATEGORIES = (process.env.DISCORD_FORUM_TOPIC_CATEGORIES ?? '13,18')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter((id) => Number.isInteger(id) && id > 0)
export const NOTIFICATIONS_SERVICE_ENABLED = getBooleanStringVar('NOTIFICATIONS_SERVICE_ENABLED', true)
export const DCL_NOTIFICATIONS_SERVICE_ENABLED = getBooleanStringVar('DCL_NOTIFICATIONS_SERVICE_ENABLED', true)
export const VOTES_VP_THRESHOLD = 5
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
export const REASON_THRESHOLD = Number(process.env.GATSBY_REASON_THRESHOLD)

export const VESTING_DASHBOARD_URL = 'https://decentraland.org/vesting/%23/'
