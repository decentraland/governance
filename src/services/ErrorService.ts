import Rollbar from 'rollbar'

import { DAO_ROLLBAR_TOKEN } from '../constants'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'

const FILTERED_ERRORS = ['FETCH_ERROR', 'ACTION_REJECTED']

export class ErrorService {
  static client = new Rollbar({
    accessToken: DAO_ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'production',
    itemsPerMinute: 10,
    maxItems: 50,
    captureIp: 'anonymize',
    ignoreDuplicateErrors: true,
    checkIgnore: (isUncaught: boolean, args: Rollbar.LogArgument[], item: Rollbar.Dictionary) => {
      const body = item.body as { message?: string }
      if (body && typeof body.message === 'string') {
        return FILTERED_ERRORS.some((errorString) => body.message?.includes(errorString))
      }
      return false
    },
  })

  public static report(errorMsg: string, extraInfo?: Record<string, unknown>) {
    if (isProdEnv()) {
      if (DAO_ROLLBAR_TOKEN) {
        this.client.error(errorMsg, { extraInfo })
      } else {
        logger.error('Rollbar server access token not found')
      }
    }
    logger.error(errorMsg, extraInfo)
  }
}
