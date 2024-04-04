import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

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
