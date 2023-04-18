import { GOVERNANCE_API } from '../constants'

export const LOCAL_DOMAINS = ['localhost', '127.0.0.1']
export const HEROKU_DOMAINS = ['herokuapp.com', 'decentraland.vote']
export const STAGING_DOMAINS = ['decentraland.zone']
export const PRODUCTION_DOMAINS = ['decentraland.org']

export function isLocalEnv() {
  return !!GOVERNANCE_API && LOCAL_DOMAINS.some((domain) => GOVERNANCE_API.includes(domain))
}

export function isHerokuEnv() {
  return !!GOVERNANCE_API && HEROKU_DOMAINS.some((domain) => GOVERNANCE_API.includes(domain))
}

export function isStagingEnv() {
  return !!GOVERNANCE_API && STAGING_DOMAINS.some((domain) => GOVERNANCE_API.includes(domain))
}

export const isProdEnv = () => {
  return !!GOVERNANCE_API && PRODUCTION_DOMAINS.some((domain) => GOVERNANCE_API.includes(domain))
}
