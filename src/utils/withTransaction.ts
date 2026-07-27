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
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // The connection may be broken; surface the original error rather than the rollback failure.
    }
    throw error
  } finally {
    client.release()
  }
}
