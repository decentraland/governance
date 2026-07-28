import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import { Pool } from 'pg'

import { closeLockPool, withPgAdvisoryLock } from './jobLocks'

// The real lock semantics are covered against Postgres in test/integration/jobLocks.test.ts. This
// file fakes pg to reach the connection-disposal branches, which a real database will not produce
// on demand.
jest.mock('pg', () => ({
  Pool: jest.fn(),
}))

const TRY_LOCK_QUERY = 'SELECT pg_try_advisory_lock(hashtext($1)) AS locked'
const UNLOCK_QUERY = 'SELECT pg_advisory_unlock(hashtext($1))'
const JOB_NAME = 'advisoryLockedJob'

describe('withPgAdvisoryLock', () => {
  let client: { query: jest.Mock; release: jest.Mock }
  let context: JobContext
  let job: jest.Mock

  beforeEach(() => {
    client = { query: jest.fn().mockResolvedValue({ rows: [{ locked: true }] }), release: jest.fn() }
    ;(Pool as unknown as jest.Mock).mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(client),
      end: jest.fn().mockResolvedValue(undefined),
    }))
    context = new JobContext(
      'id',
      'handler',
      {},
      async () => {},
      async () => {}
    )
    job = jest.fn().mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await closeLockPool()
    jest.resetAllMocks()
  })

  describe('when the lock is acquired and the job succeeds', () => {
    beforeEach(async () => {
      await withPgAdvisoryLock(JOB_NAME, job)(context)
    })

    it('should run the job', () => {
      expect(job).toHaveBeenCalledTimes(1)
    })

    it('should release the advisory lock', () => {
      expect(client.query).toHaveBeenCalledWith(UNLOCK_QUERY, [JOB_NAME])
    })

    it('should return the connection to the pool without an error', () => {
      expect(client.release).toHaveBeenCalledWith()
    })
  })

  describe('when the unlock query fails', () => {
    let unlockError: Error
    let outcome: unknown

    beforeEach(async () => {
      unlockError = new Error('unlock failed')
      client.query.mockImplementation((sql: string) =>
        sql === UNLOCK_QUERY ? Promise.reject(unlockError) : Promise.resolve({ rows: [{ locked: true }] })
      )
      outcome = await withPgAdvisoryLock(
        JOB_NAME,
        job
      )(context)
        .then(() => 'resolved')
        .catch((error) => error)
    })

    it('should destroy the connection rather than pool one that may still hold the lock', () => {
      expect(client.release).toHaveBeenCalledWith(unlockError)
    })

    it('should not surface the unlock failure to the caller, since the job itself succeeded', () => {
      expect(outcome).toBe('resolved')
    })
  })

  describe('when another session already holds the lock', () => {
    beforeEach(async () => {
      client.query.mockResolvedValue({ rows: [{ locked: false }] })
      await withPgAdvisoryLock(JOB_NAME, job)(context)
    })

    it('should skip the job', () => {
      expect(job).not.toHaveBeenCalled()
    })

    it('should not unlock a lock it never took', () => {
      expect(client.query).not.toHaveBeenCalledWith(UNLOCK_QUERY, [JOB_NAME])
    })

    it('should return the connection to the pool without an error', () => {
      expect(client.release).toHaveBeenCalledWith()
    })
  })

  describe('when the query that takes the lock returns no rows', () => {
    beforeEach(async () => {
      client.query.mockResolvedValue({ rows: [] })
      await withPgAdvisoryLock(JOB_NAME, job)(context)
    })

    it('should treat the missing result as not acquired and skip the job', () => {
      expect(job).not.toHaveBeenCalled()
    })
  })

  describe('when the job throws', () => {
    let jobError: Error
    let thrown: unknown

    beforeEach(async () => {
      jobError = new Error('job failed')
      job = jest.fn().mockRejectedValue(jobError)
      thrown = await withPgAdvisoryLock(JOB_NAME, job)(context).catch((error) => error)
    })

    it('should propagate the error raised by the job', () => {
      expect(thrown).toBe(jobError)
    })

    it('should still release the advisory lock', () => {
      expect(client.query).toHaveBeenCalledWith(UNLOCK_QUERY, [JOB_NAME])
    })
  })

  describe('when the lock query itself fails', () => {
    let lockError: Error
    let thrown: unknown

    beforeEach(async () => {
      lockError = new Error('connection lost')
      client.query.mockImplementation((sql: string) =>
        sql === TRY_LOCK_QUERY ? Promise.reject(lockError) : Promise.resolve({ rows: [] })
      )
      thrown = await withPgAdvisoryLock(JOB_NAME, job)(context).catch((error) => error)
    })

    it('should propagate the failure', () => {
      expect(thrown).toBe(lockError)
    })

    it('should not run the job', () => {
      expect(job).not.toHaveBeenCalled()
    })

    it('should return the connection to the pool', () => {
      expect(client.release).toHaveBeenCalledWith()
    })
  })
})
