import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import { Pool } from 'pg'

import logger from '../utils/logger'

type JobFunction = (context: JobContext) => Promise<void>

export const JOB_LOCKS = new Map<string, boolean>()

export const isLockAcquired = (jobName: string): boolean => {
  return JOB_LOCKS.has(jobName)
}

const acquireLock = (jobName: string): void => {
  JOB_LOCKS.set(jobName, true)
}

const releaseLock = (jobName: string): void => {
  JOB_LOCKS.delete(jobName)
}

/**
 * In-process guard. Only prevents overlap within a single Node process; it does NOT
 * coordinate across instances. Prefer `withPgAdvisoryLock` for anything that mutates
 * shared state (budgets, proposal status, side effects) so overlap is impossible even
 * when the web process runs on more than one dyno.
 */
export const withLock = (jobName: string, jobFunction: JobFunction) => async (context: JobContext) => {
  if (isLockAcquired(jobName)) {
    console.log(`${jobName} is already running.`)
    return
  }
  acquireLock(jobName)
  try {
    await jobFunction(context)
  } finally {
    releaseLock(jobName)
  }
}

let lockPool: Pool | undefined

// Lazily created so merely importing this module (e.g. in unit tests) never opens a pool.
function getLockPool(): Pool {
  if (!lockPool) {
    lockPool = new Pool({ connectionString: process.env.CONNECTION_STRING })
  }
  return lockPool
}

/**
 * Cross-instance mutual exclusion via a Postgres session-level advisory lock.
 *
 * A given lock key can be held by only one database session at a time, so overlapping
 * runs — whether from a slow job spilling into the next cron tick on the same process, or
 * from the job firing on multiple dynos — are serialized: the first run acquires the lock
 * and every concurrent run skips. The lock is held on a dedicated connection for the whole
 * job and released in `finally`; if the process crashes the connection drops and Postgres
 * releases the lock automatically, so a stale lock cannot wedge the job.
 *
 * This is the primitive the finish/publish jobs need because they read shared budget/proposal
 * state and fire non-idempotent side effects (events, notifications, badge airdrops, forum and
 * Discord posts) that must not run twice for the same transition.
 */
export const withPgAdvisoryLock = (jobName: string, jobFunction: JobFunction) => async (context: JobContext) => {
  const client = await getLockPool().connect()
  let lockAcquired = false
  try {
    // hashtext() maps the job name to the int key pg_try_advisory_lock expects. It returns
    // immediately with false (never blocks) when another session already holds the lock.
    const result = await client.query<{ locked: boolean }>('SELECT pg_try_advisory_lock(hashtext($1)) AS locked', [
      jobName,
    ])
    if (!result.rows[0]?.locked) {
      logger.log(`${jobName} is already running on another instance, skipping this run.`)
      return
    }
    lockAcquired = true
    await jobFunction(context)
  } finally {
    if (lockAcquired) {
      try {
        await client.query('SELECT pg_advisory_unlock(hashtext($1))', [jobName])
        client.release()
      } catch (unlockError) {
        // The unlock failed while the session may still hold the lock. Destroy the connection
        // (release with an error) instead of returning it to the pool: a returned connection that
        // still holds the lock would let a later re-entrant pg_try_advisory_lock wrongly succeed
        // and never truly release. Discarding it lets Postgres free the lock on disconnect.
        client.release(unlockError as Error)
      }
    } else {
      client.release()
    }
  }
}
