import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { JOB_LOCKS, withLock } from './jobLocks'

describe('Job Locking Mechanism', () => {
  const exampleContext: JobContext = new JobContext(
    'id',
    'handler',
    {},
    async () => {},
    async () => {}
  )

  const immediateJob = jest.fn().mockResolvedValue(0)

  const delayedJob = jest
    .fn()
    .mockImplementation(
      () => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Simulated job error')), 100))
    )

  beforeEach(() => {
    JOB_LOCKS.clear()
    jest.clearAllMocks()
  })

  it('should acquire and release lock for a job that completes successfully', async () => {
    const jobName = 'immediateJob'
    const lockedJob = withLock(jobName, immediateJob)

    await lockedJob(exampleContext)

    expect(immediateJob).toHaveBeenCalledTimes(1)
    expect(JOB_LOCKS.has(jobName)).toBe(false) // Lock should be released
  })

  it('should acquire and release lock for a job that fails', async () => {
    const jobName = 'delayedJob'
    const lockedJob = withLock(jobName, delayedJob)

    try {
      await lockedJob(exampleContext)
    } catch (error) {
      expect(delayedJob).toHaveBeenCalledTimes(1)
      expect(JOB_LOCKS.has(jobName)).toBe(false) // Lock should be released even on error
      expect(error).toBeDefined() // Ensure error is thrown
    }
  })

  it('should not execute job if it is already running', async () => {
    const jobName = 'concurrentJob'
    const firstJob = withLock(jobName, delayedJob)
    const secondJob = withLock(jobName, immediateJob)

    const firstPromise = firstJob(exampleContext)
    const secondPromise = secondJob(exampleContext)
    try {
      await Promise.all([firstPromise, secondPromise])
    } catch (error) {
      expect((error as Error).message).toBe('Simulated job error')
    }

    expect(delayedJob).toHaveBeenCalledTimes(1)
    expect(immediateJob).not.toHaveBeenCalled()

    // Try again after lock is released
    await secondJob(exampleContext)
    expect(immediateJob).toHaveBeenCalledTimes(1) // Second job should execute now
  })
})
