import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

export const GRANT_PROPOSAL_DURATION_IN_SECONDS = env('GATSBY_GRANT_PROPOSAL_DURATION_IN_SECONDS', '1209600')
export const MAX_LOWER_TIER_GRANT_FUNDING = 20000
export const BUDGETING_START_DATE = Time.utc('2023-01-01 00:00:00Z').toDate()
