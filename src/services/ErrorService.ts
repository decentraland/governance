import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Rollbar from 'rollbar'

import { GOVERNANCE_API, ROLLBAR_TOKEN } from '../constants'
import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from '../utils/governanceEnvs'

const FILTERED_ERRORS = ['FETCH_ERROR', 'ACTION_REJECTED']

export class ErrorService {
  static client = new Rollbar({
    accessToken: ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: this.getEnvironmentNameForRollbar(),
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

  private static getEnvironmentNameForRollbar() {
    if (!GOVERNANCE_API || GOVERNANCE_API.length === 0) return 'test'
    if (isLocalEnv()) return 'local'
    if (isHerokuEnv()) return 'heroku'
    if (isStagingEnv()) return 'staging'
    return 'production'
  }

  public static report(errorMsg: string, data?: Record<string, unknown>) {
    if (ROLLBAR_TOKEN) {
      this.client.error(errorMsg, data)
    } else {
      if (isProdEnv()) logger.error('Rollbar server access token not found')
    }
    logger.error(errorMsg, data)
  }

  public static reportAndThrow(errorMsg: string, data: Record<string, any>) {
    this.report(errorMsg, data)
    throw new Error(errorMsg)
  }
}
