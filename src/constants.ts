import { ChainId } from '@dcl/schemas'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { trimOtterspaceId } from './back/utils/contractInteractions'
import { OTTERSPACE_DAO_RAFT_ID } from './entities/Snapshot/constants'
import { clientEnv } from './utils/clientEnv'
import Candidates from './utils/delegates/candidates.json'

import env from './config'

function getBooleanStringVar(variableName: string, defaultValue: boolean) {
  const enabled = env(variableName)
  if (enabled && enabled.length > 0) return enabled === 'true'
  return defaultValue
}

export const DAO_VESTING_CONTRACT_ADDRESS = '0x7a3abf8897f31b56f09c6f69d074a393a905c1ac'
export const GOVERNANCE_URL = process.env.GATSBY_GOVERNANCE_URL || 'https://decentraland.zone/governance'
export const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/'
export const FORUM_URL = process.env.GATSBY_DISCOURSE_API || clientEnv('GATSBY_DISCOURSE_API') || ''
export const GOVERNANCE_API = process.env.GATSBY_GOVERNANCE_API || clientEnv('GATSBY_GOVERNANCE_API') || ''
export const DAO_DISCORD_URL = 'https://dcl.gg/dao-discord'
export const OPEN_CALL_FOR_DELEGATES_LINK = 'https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840'
export const CANDIDATE_ADDRESSES = Candidates.map((delegate) => delegate.address)
export const DAO_ROLLBAR_TOKEN = process.env.DAO_ROLLBAR_TOKEN
export const SEGMENT_KEY = clientEnv('GATSBY_SEGMENT_KEY') || ''
export const LOCAL_ENV_VAR = clientEnv('GATSBY_LOCAL_ENV_VAR') || ''
export const TEST_ENV_VAR = clientEnv('GATSBY_TEST_ENV_VAR') || ''
export const PROD_ENV_VAR = clientEnv('GATSBY_PROD_ENV_VAR') || ''
export const DISCORD_SERVICE_ENABLED = getBooleanStringVar('DISCORD_SERVICE_ENABLED', true)
export const NOTIFICATIONS_SERVICE_ENABLED = getBooleanStringVar('NOTIFICATIONS_SERVICE_ENABLED', true)
export const VOTES_VP_THRESHOLD = 5
export const SSO_URL = clientEnv('GATSBY_SSO_URL') ?? undefined
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
export const CORE_UNITS_BADGE_CID = [
  'bafyreidmzou4wiy2prxq4jdyg66z7s3wulpfq2a7ar6sdkrixrj3b5mgwe', // Governance Squad
  'bafyreih5t62qmeiugca6bp7dtubrd3ponqfndbim54e3vg4cfbroledohq', // Grant Support Squad
  'bafyreicsrpymlwm4hutebi2qio3e5hhzpqtyr6fv3ei6nsybb3vannhfgy', // Facilitation Squad
  'bafyreigm5fqqryvoboszxbrzeks5jihsc4mwb4mq26csdmooaju5g7ksja', // Strategic Unit Squad
]
export const DEBUG_ADDRESSES = (process.env.DEBUG_ADDRESSES || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

export const SNAPSHOT_STATUS_ENABLED =
  process.env.SNAPSHOT_STATUS_ENABLED === 'true' || getBooleanStringVar('SNAPSHOT_STATUS_ENABLED', true)
export const SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE = Number(process.env.SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE || 30)
export const SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD = Number(process.env.SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD || 0.33)
export const DEFAULT_CHAIN_ID =
  process.env.GATSBY_DEFAULT_CHAIN_ID || clientEnv('GATSBY_DEFAULT_CHAIN_ID', String(ChainId.ETHEREUM_MAINNET))
export const PUSH_CHANNEL_ID = process.env.GATSBY_PUSH_CHANNEL_ID || clientEnv('GATSBY_PUSH_CHANNEL_ID')

export const BUY_LAND_URL = process.env.GATSBY_BUY_LAND_URL || clientEnv('GATSBY_BUY_LAND_URL')
export const BUY_WEARABLES_URL = process.env.GATSBY_BUY_WEARABLES_URL || clientEnv('GATSBY_BUY_WEARABLES_URL')
export const BUY_NAME_URL = process.env.GATSBY_BUY_NAME_URL || clientEnv('GATSBY_BUY_NAME_URL')
export const BUY_MANA_URL = process.env.GATSBY_BUY_MANA_URL || clientEnv('GATSBY_BUY_MANA_URL')

export const DCL_META_IMAGE_URL = 'https://decentraland.org/images/decentraland.png'
export const JOIN_DISCORD_URL = clientEnv('GATSBY_JOIN_DISCORD_URL') || 'https://dcl.gg/discord'
