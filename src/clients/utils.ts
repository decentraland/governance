const SNAPSHOT_SKIP_LIMIT = 5000

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
        if (skip > SNAPSHOT_SKIP_LIMIT) {
          throw new Error(`${fetchFunction.name} has exceeded Snapshot skip limit`)
        }
      }
    }
    return allResults
  } catch (error) {
    console.error(`Error while executing ${fetchFunction.name} in batches: `, error)
    // TODO: report error to Rollbar
    return []
  }
}

export function trimLastForwardSlash(url: string) {
  return url.replace(/\/$/, '')
}
