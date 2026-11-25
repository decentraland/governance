import { redactSecrets } from '../utils/redactSecrets'

import { ErrorClient } from './ErrorClient'

const SUBGRAPH_SKIP_LIMIT = 5000
const DEFAULT_FETCH_TIMEOUT_MS = 30000

/**
 * fetch wrapper that aborts after `timeoutMs` so a hung upstream cannot keep the
 * request (and its socket) open indefinitely.
 */
export async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * POSTs a GraphQL query with a timeout and validates the response, so an HTTP error
 * (429/500/HTML gateway page) or a GraphQL `errors` payload throws instead of being
 * silently interpreted as "no data". The timeout covers reading the body too: a server that
 * sends its headers and then stalls must not hang the caller.
 */
export async function queryGraphql<T>(url: string, body: unknown, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort()
      reject(new Error(`GraphQL request to ${redactSecrets(url)} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })
  // It may fire while nothing races it (while a body is cancelled); that must not surface as unhandled.
  timedOut.catch(() => undefined)

  try {
    const response = await Promise.race([
      fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      }),
      timedOut,
    ])

    if (!response.ok) {
      // Unread, the body would hold its connection until it is garbage collected.
      await response.body?.cancel().catch(() => undefined)
      throw new Error(`GraphQL request to ${redactSecrets(url)} failed with status ${response.status}`)
    }

    const json = await Promise.race([response.json(), timedOut])
    if (json?.errors) {
      throw new Error(`GraphQL request to ${redactSecrets(url)} returned errors: ${JSON.stringify(json.errors)}`)
    }

    return json as T
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function inBatches<T, K>(
  fetchFunction: (params: T, skip: number, batchSize: number) => Promise<K[]>,
  params: T,
  batchSize = 1000
) {
  let allResults: K[] = []
  let hasNext = true
  let skip = 0
  try {
    while (hasNext) {
      const results: K[] = await fetchFunction(params, skip, batchSize)
      allResults = [...allResults, ...results]
      if (results.length < batchSize) {
        hasNext = false
      } else {
        skip = allResults.length
        if (skip > SUBGRAPH_SKIP_LIMIT) {
          throw new Error(`${fetchFunction.name} has exceeded skip limit`)
        }
      }
    }
    return allResults
  } catch (error) {
    // Report the failure (so an upstream outage is visible, not silent) and return
    // whatever was collected so far instead of discarding partial results.
    ErrorClient.report(`Error while executing ${fetchFunction.name} in batches: `, {
      error: redactSecrets(`${error}`),
    })
    return allResults
  }
}

export function trimLastForwardSlash(url: string) {
  return url.replace(/\/$/, '')
}
