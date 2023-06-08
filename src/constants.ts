import Candidates from './modules/delegates/candidates.json'
import { env } from './modules/env'

function getBooleanStringVar(variableName: string, defaultValue: boolean) {
  const enabled = env(variableName)
  if (enabled && enabled.length > 0) return enabled === 'true'
  return defaultValue
}

export const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/'
export const FORUM_URL = process.env.GATSBY_DISCOURSE_API || env('GATSBY_DISCOURSE_API') || ''
export const GOVERNANCE_API = process.env.GATSBY_GOVERNANCE_API || env('GATSBY_GOVERNANCE_API') || ''
export const DAO_DISCORD_URL = 'https://dcl.gg/dao-discord'
export const NEWSLETTER_URL = 'https://mailchi.mp/decentraland.org/decentraland-dao-weekly-newsletter'
export const OPEN_CALL_FOR_DELEGATES_LINK = 'https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840'
export const CANDIDATE_ADDRESSES = Candidates.map((delegate) => delegate.address)
export const ROLLBAR_TOKEN = process.env.ROLLBAR_TOKEN
export const SEGMENT_KEY = env('GATSBY_SEGMENT_KEY') || ''
export const LOCAL_ENV_VAR = env('GATSBY_LOCAL_ENV_VAR') || ''
export const TEST_ENV_VAR = env('GATSBY_TEST_ENV_VAR') || ''
export const PROD_ENV_VAR = env('GATSBY_PROD_ENV_VAR') || ''
export const DISCORD_SERVICE_ENABLED = getBooleanStringVar('DISCORD_SERVICE_ENABLED', true)
export const VOTES_VP_THRESHOLD = 5
