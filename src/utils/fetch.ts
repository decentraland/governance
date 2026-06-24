/**
 * Discards an unread fetch Response body.
 *
 * With native fetch (undici keep-alive) an unconsumed body pins the underlying
 * socket until garbage collection. Any path that discards a response without
 * reading it (early return, throw, fire-and-forget) must drain it first.
 */
export async function drainResponse(response: Response): Promise<void> {
  if (!response.bodyUsed) {
    await response.body?.cancel().catch(() => undefined)
  }
}
