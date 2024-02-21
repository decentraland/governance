import { ErrorClient } from './ErrorClient'

const SUBGRAPH_SKIP_LIMIT = 5000

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
    ErrorClient.report(`Error while executing ${fetchFunction.name} in batches: `, { error: `${error}` })
    return []
  }
}

export function trimLastForwardSlash(url: string) {
  return url.replace(/\/$/, '')
}
