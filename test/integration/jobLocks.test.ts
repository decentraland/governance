import JobContext from 'decentraland-gatsby/dist/entities/Job/context'
import { Pool } from 'pg'

import { closeLockPool, withPgAdvisoryLock } from '../../src/jobs/jobLocks'

// Each test uses its own lock key, so a leaked lock cannot make a later test look like a skip.
let jobCounter = 0

describe('withPgAdvisoryLock', () => {
  let probePool: Pool
  let context: JobContext
  let jobName: string
  let releaseHeldLock: (() => Promise<void>) | undefined

  // Takes the lock from a separate database session, standing in for another dyno holding it.
  async function holdLockFromAnotherSession(name: string): Promise<() => Promise<void>> {
    const client = await probePool.connect()
    const { rows } = await client.query<{ locked: boolean }>('SELECT pg_try_advisory_lock(hashtext($1)) AS locked', [
      name,
    ])
    if (!rows[0]?.locked) {
      client.release()
      throw new Error(`Could not take the "${name}" advisory lock for the test`)
    }
    return async () => {
      await client.query('SELECT pg_advisory_unlock(hashtext($1))', [name])
      client.release()
    }
  }

  // Probes from a separate session, so it reports whether the lock was really given up rather
  // than whether the holding session can re-enter it.
  async function isLockFree(name: string): Promise<boolean> {
    const client = await probePool.connect()
    try {
      const { rows } = await client.query<{ locked: boolean }>('SELECT pg_try_advisory_lock(hashtext($1)) AS locked', [
        name,
      ])
      if (!rows[0]?.locked) {
        return false
      }
      await client.query('SELECT pg_advisory_unlock(hashtext($1))', [name])
      return true
    } finally {
      client.release()
    }
  }

  beforeEach(() => {
    probePool = new Pool({ connectionString: process.env.CONNECTION_STRING })
    context = new JobContext(
      'id',
      'handler',
      {},
      async () => {},
      async () => {}
    )
    jobName = `integration-test-job-${(jobCounter += 1)}`
  })

  afterEach(async () => {
    if (releaseHeldLock) {
      await releaseHeldLock()
      releaseHeldLock = undefined
    }
    await closeLockPool()
    await probePool.end()
    jest.clearAllMocks()
  })

  describe('when the lock is available', () => {
    let job: jest.Mock

    beforeEach(async () => {
      job = jest.fn().mockResolvedValue(undefined)
      await withPgAdvisoryLock(jobName, job)(context)
    })

    it('should run the job', () => {
      expect(job).toHaveBeenCalledTimes(1)
    })

    it('should release the lock once the job finishes', async () => {
      expect(await isLockFree(jobName)).toBe(true)
    })
  })

  describe('when another database session already holds the lock', () => {
    let job: jest.Mock

    beforeEach(async () => {
      releaseHeldLock = await holdLockFromAnotherSession(jobName)
      job = jest.fn().mockResolvedValue(undefined)
      await withPgAdvisoryLock(jobName, job)(context)
    })

    it('should skip the job instead of running it a second time', () => {
      expect(job).not.toHaveBeenCalled()
    })

    describe('and that session releases the lock', () => {
      beforeEach(async () => {
        if (releaseHeldLock) {
          await releaseHeldLock()
          releaseHeldLock = undefined
        }
        await withPgAdvisoryLock(jobName, job)(context)
      })

      it('should run the job on the next attempt', () => {
        expect(job).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('when the job throws', () => {
    let job: jest.Mock
    let jobError: Error
    let thrown: unknown

    beforeEach(async () => {
      jobError = new Error('job failed')
      job = jest.fn().mockRejectedValue(jobError)
      thrown = await withPgAdvisoryLock(jobName, job)(context).catch((error) => error)
    })

    it('should propagate the error raised by the job', () => {
      expect(thrown).toBe(jobError)
    })

    it('should still release the lock, so a failure does not wedge every later run', async () => {
      expect(await isLockFree(jobName)).toBe(true)
    })
  })

  describe('when a second run starts while the first is still holding the lock', () => {
    let firstJob: jest.Mock
    let secondJob: jest.Mock

    beforeEach(async () => {
      let allowFirstToFinish: () => void = () => undefined
      const firstMayFinish = new Promise<void>((resolve) => {
        allowFirstToFinish = resolve
      })
      let markFirstAsRunning: () => void = () => undefined
      const firstIsRunning = new Promise<void>((resolve) => {
        markFirstAsRunning = resolve
      })

      firstJob = jest.fn().mockImplementation(async () => {
        markFirstAsRunning()
        await firstMayFinish
      })
      secondJob = jest.fn().mockResolvedValue(undefined)

      // Start the second run only once the first is provably inside its job body, so the
      // assertion is about the lock rather than about which run reached Postgres first.
      const firstRun = withPgAdvisoryLock(jobName, firstJob)(context)
      await firstIsRunning
      await withPgAdvisoryLock(jobName, secondJob)(context)
      allowFirstToFinish()
      await firstRun
    })

    it('should run the first job', () => {
      expect(firstJob).toHaveBeenCalledTimes(1)
    })

    it('should skip the overlapping second job', () => {
      expect(secondJob).not.toHaveBeenCalled()
    })
  })
})
