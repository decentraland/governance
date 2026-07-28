import { Pool, PoolClient } from 'pg'

let pool: Pool | undefined

// Lazily created so importing this module (e.g. in unit tests) never opens a pool.
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.CONNECTION_STRING })
  }
  return pool
}

// Closes the transaction pool. Mainly for tests, so the process can exit cleanly.
export async function closeTransactionPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}

// Runs fn inside a single transaction on a dedicated client: BEGIN, COMMIT on success, ROLLBACK on
// any error. The client is always released. Use it when several writes must commit atomically.
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  // Set when COMMIT/ROLLBACK itself fails, which leaves the session's transaction state unknown.
  let cleanupError: Error | undefined
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    try {
      await client.query('COMMIT')
    } catch (commitError) {
      cleanupError = commitError as Error
      throw commitError
    }
    return result
  } catch (error) {
    // A failed COMMIT already aborted the transaction, and the connection is about to be discarded,
    // so only roll back when the failure came from fn.
    if (!cleanupError) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        // Surface the original error rather than the rollback failure, but remember that this
        // connection may still be sitting in an open transaction.
        cleanupError = rollbackError as Error
      }
    }
    throw error
  } finally {
    // Releasing with an error destroys the connection instead of returning a client that may be
    // broken or still inside a transaction to the pool.
    client.release(cleanupError)
  }
}
