import { ErrorClient } from './ErrorClient'

const SUBGRAPH_SKIP_LIMIT = 5000
const DEFAULT_FETCH_TIMEOUT_MS = 30000

/**
 * Strips API keys that are embedded in URLs (The Graph gateway path segment and `apiKey`
 * query params) so they are not leaked into logs or error reports.
 */
export function redactSecrets(text: string): string {
  return text
    .replace(/(\/api\/)[^/\s]+(\/subgraphs)/g, '$1<redacted>$2')
    .replace(/([?&]apiKey=)[^&\s]+/gi, '$1<redacted>')
}

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
 * silently interpreted as "no data".
 */
export async function queryGraphql<T>(url: string, body: unknown): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request to ${redactSecrets(url)} failed with status ${response.status}`)
  }

  const json = await response.json()
  if (json?.errors) {
    throw new Error(`GraphQL request to ${redactSecrets(url)} returned errors: ${JSON.stringify(json.errors)}`)
  }

  return json as T
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
