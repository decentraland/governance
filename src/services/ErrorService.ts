import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Rollbar from 'rollbar'

import { ROLLBAR_TOKEN } from '../constants'
import { isDevEnv } from '../modules/isDevEnv'

export class ErrorService {
  static client = new Rollbar({
    accessToken: ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

  private static getEnvironmentNameForRollbar() {
    return { environment: isDevEnv() ? 'development' : 'production' }
  }

  public static report(errorMsg: string, error?: any) {
    if (ROLLBAR_TOKEN) {
      this.client.error(errorMsg, error, this.getEnvironmentNameForRollbar())
    } else {
      if (!isDevEnv()) logger.error('Rollbar server access token not found')
    }
    logger.error(errorMsg, error)
  }

  public static reportAndThrow(errorMsg: string, error: any) {
    this.report(errorMsg, error)
    throw new Error(error)
  }
}
