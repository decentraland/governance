import { env } from '../../modules/env'

export const MESSAGE_TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
export const GATSBY_DISCOURSE_CONNECT_THREAD =
  process.env.GATSBY_DISCOURSE_CONNECT_THREAD || env('GATSBY_DISCOURSE_CONNECT_THREAD')
