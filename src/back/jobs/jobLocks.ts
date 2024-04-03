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

export const withLock = (jobName: string, jobFunction: () => Promise<unknown>) => async () => {
  if (!acquireLock(jobName)) {
    console.log(`${jobName} is already running.`)
    return
  }
  try {
    await jobFunction()
  } finally {
    releaseLock(jobName)
  }
}
