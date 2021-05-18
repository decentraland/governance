import env, { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { DiscourseAuth } from '../../api/Discourse'

export const DISCOURSE_API = requiredEnv('DISCOURSE_API')
export const DISCOURSE_URL = env('DISCOURSE_URL', DISCOURSE_API)
export const DISCOURSE_API_KEY = requiredEnv('DISCOURSE_API_KEY')
export const DISCOURSE_CATEGORY = requiredEnv('DISCOURSE_CATEGORY')
export const DISCOURSE_USER = requiredEnv('DISCOURSE_USER')
export const DISCOURSE_AUTH: DiscourseAuth = {
  apiKey: DISCOURSE_API_KEY,
  apiUsername: DISCOURSE_USER
}