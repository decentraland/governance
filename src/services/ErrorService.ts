import { Env } from '@dcl/ui-env'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Rollbar from 'rollbar'

import { config } from '../config'
import { ROLLBAR_SERVER_TOKEN } from '../constants'

export class ErrorService {
  static client = new Rollbar({
    accessToken: ROLLBAR_SERVER_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })

  private static getEnvironment() {
    const env = config.getEnv()
    return { environment: env === Env.PRODUCTION ? 'production' : env }
  }

  public static report(errorMsg: string, error?: any) {
    if (ROLLBAR_SERVER_TOKEN) {
      this.client.error(errorMsg, error, this.getEnvironment())
    } else {
      logger.error('Rollbar server access token not found.')
    }
    logger.error(errorMsg, error)
  }

  public static reportAndThrow(errorMsg: string, error: any) {
    this.report(errorMsg, error)
    throw new Error(error)
  }
}
