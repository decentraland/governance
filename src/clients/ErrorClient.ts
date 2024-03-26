import { Governance } from './Governance'

export class ErrorClient {
  public static report(errorMsg: string, extraInfo?: Record<string, unknown>) {
    try {
      const isClientSide = typeof window !== 'undefined'
      if (isClientSide) {
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
