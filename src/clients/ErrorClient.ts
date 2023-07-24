import { DAO_ROLLBAR_TOKEN } from '../constants'

import { Governance } from './Governance'

export class ErrorClient {
  static isServerSide = DAO_ROLLBAR_TOKEN && DAO_ROLLBAR_TOKEN.length > 0

  public static report(errorMsg: string, extraInfo?: Record<string, unknown>) {
    try {
      if (!this.isServerSide) {
        Governance.get().reportErrorToServer(errorMsg, extraInfo)
      } else {
        const ErrorService = require('../services/ErrorService.ts')
        ErrorService.report(errorMsg, extraInfo)
      }
    } catch (e) {
      console.error('Error reporting error', e)
    }
  }
}
