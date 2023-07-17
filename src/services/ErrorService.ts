import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Rollbar from 'rollbar'

import { GOVERNANCE_API, ROLLBAR_TOKEN } from '../constants'
import { isHerokuEnv, isLocalEnv, isProdEnv, isStagingEnv } from '../utils/governanceEnvs'

export class ErrorService {
  static client = new Rollbar({
    accessToken: ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: this.getEnvironmentNameForRollbar(),
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
