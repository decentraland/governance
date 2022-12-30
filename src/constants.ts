import Candidates from './modules/delegates/candidates.json'
import { env } from './modules/env'

export const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/'
export const FORUM_URL = env('GATSBY_DISCOURSE_API') || ''
export const GOVERNANCE_API = process.env.GATSBY_GOVERNANCE_API || env('GATSBY_GOVERNANCE_API') || ''
export const DAO_DISCORD_URL = 'https://discord.gg/amkcFrqPBh'
export const NEWSLETTER_URL = 'https://mailchi.mp/decentraland.org/decentraland-dao-weekly-newsletter'
export const OPEN_CALL_FOR_DELEGATES_LINK = 'https://forum.decentraland.org/t/open-call-for-delegates-apply-now/5840'
export const CANDIDATE_ADDRESSES = Candidates.map((delegate) => delegate.address)
export const ROLLBAR_TOKEN = env('GATSBY_ROLLBAR_TOKEN')
export const SEGMENT_KEY = env('GATSBY_SEGMENT_KEY')
