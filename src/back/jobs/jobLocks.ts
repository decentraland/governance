import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

type JobFunction = (context: JobContext) => Promise<void>

export const JOB_LOCKS = new Map<string, boolean>() // in-memory lock store

const acquireLock = (jobName: string): boolean => {
  if (JOB_LOCKS.get(jobName)) {
    return false
  }
  JOB_LOCKS.set(jobName, true)
  return true
}

const releaseLock = (jobName: string): void => {
  JOB_LOCKS.delete(jobName)
}

export const withLock = (jobName: string, jobFunction: JobFunction) => async (context: JobContext) => {
  if (!acquireLock(jobName)) {
    console.log(`${jobName} is already running.`)
    return
  }
  try {
    await jobFunction(context)
  } finally {
    releaseLock(jobName)
  }
}
