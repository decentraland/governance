import logger from './logger'

/**
 * Discards an unread fetch Response body.
 *
 * With native fetch (undici keep-alive) an unconsumed body pins the underlying
 * socket until garbage collection. Any path that discards a response without
 * reading it (early return, throw, fire-and-forget) must drain it first.
 */
export async function drainResponse(response: Response): Promise<void> {
  if (!response.bodyUsed) {
    await response.body?.cancel().catch((error) => {
      // Cancelling an already-settled body is benign; log (no debug level in this
      // logger, so warn) only so the rare genuine failure stays diagnosable.
      logger.warn('drainResponse: failed to cancel response body', {
        error: error instanceof Error ? error.message : String(error),
      })
    })
  }
}
