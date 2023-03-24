import { GOVERNANCE_API } from '../constants'

const DEV_DOMAINS = ['decentraland.zone', 'herokuapp.com', 'decentraland.vote', 'localhost']

export function isDevApi(apiUrl: string) {
  return DEV_DOMAINS.some((envName) => apiUrl.includes(envName))
}

export const isDevEnv = () => {
  return isDevApi(GOVERNANCE_API || '')
}
