import { env } from '../../modules/env'

import { ValidationMessage } from './types'

export const MESSAGE_TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
export const VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}
export const GATSBY_DISCOURSE_CONNECT_THREAD =
  process.env.GATSBY_DISCOURSE_CONNECT_THREAD || env('GATSBY_DISCOURSE_CONNECT_THREAD')
