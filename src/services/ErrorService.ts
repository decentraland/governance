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

  public static report(errorMsg: string, error?: any) {
    if (ROLLBAR_TOKEN) {
      this.client.error(errorMsg, error)
    } else {
      if (isProdEnv()) logger.error('Rollbar server access token not found')
    }
    logger.error(errorMsg, error)
  }

  public static reportAndThrow(errorMsg: string, error: any) {
    this.report(errorMsg, error)
    throw new Error(error)
  }
}
