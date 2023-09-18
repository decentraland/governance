import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { trimOtterspaceId } from './back/utils/contractInteractions'
import { OTTERSPACE_DAO_RAFT_ID } from './entities/Snapshot/constants'
import Candidates from './utils/delegates/candidates.json'
import { env } from './utils/env'

function getBooleanStringVar(variableName: string, defaultValue: boolean) {
  const enabled = env(variableName)
  if (enabled && enabled.length > 0) return enabled === 'true'
  return defaultValue
}

export const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/'
export const FORUM_URL = process.env.GATSBY_DISCOURSE_API || env('GATSBY_DISCOURSE_API') || ''
export const GOVERNANCE_API = process.env.GATSBY_GOVERNANCE_API || env('GATSBY_GOVERNANCE_API') || ''
export const DAO_DISCORD_URL = 'https://dcl.gg/dao-discord'
export const OPEN_CALL_FOR_DELEGATES_LINK = 'https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840'
export const CANDIDATE_ADDRESSES = Candidates.map((delegate) => delegate.address)
export const DAO_ROLLBAR_TOKEN = process.env.DAO_ROLLBAR_TOKEN
export const SEGMENT_KEY = env('GATSBY_SEGMENT_KEY') || ''
export const LOCAL_ENV_VAR = env('GATSBY_LOCAL_ENV_VAR') || ''
export const TEST_ENV_VAR = env('GATSBY_TEST_ENV_VAR') || ''
export const PROD_ENV_VAR = env('GATSBY_PROD_ENV_VAR') || ''
export const DISCORD_SERVICE_ENABLED = getBooleanStringVar('DISCORD_SERVICE_ENABLED', true)
export const VOTES_VP_THRESHOLD = 5
export const SSO_URL = env('GATSBY_SSO_URL') ?? undefined
export const RAFT_OWNER_PK = process.env.RAFT_OWNER_PK || ''
export const POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS || ''
export const POLYGON_RAFTS_CONTRACT_ADDRESS = process.env.POLYGON_RAFTS_CONTRACT_ADDRESS || ''
export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || ''
export const LEGISLATOR_BADGE_SPEC_CID = process.env.LEGISLATOR_BADGE_SPEC_CID || ''
export const LAND_OWNER_BADGE_SPEC_CID = process.env.LAND_OWNER_BADGE_SPEC_CID || ''
export const TRIMMED_OTTERSPACE_RAFT_ID = trimOtterspaceId(OTTERSPACE_DAO_RAFT_ID)
export const TOP_VOTERS_PER_MONTH = 3
export const TOP_VOTER_BADGE_IMG_URL = process.env.TOP_VOTER_BADGE_IMG_URL || ''
export const DEBUG_ADDRESSES = (env('DEBUG_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())
