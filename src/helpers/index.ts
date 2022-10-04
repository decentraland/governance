import logger from 'decentraland-gatsby/dist/entities/Development/logger'

export function inBackground(fun: () => Promise<any>) {
  Promise.resolve()
    .then(fun)
    .then((result) => logger.log('Completed background task', { result: JSON.stringify(result) }))
    .catch((err) => logger.error('Error running background task', formatError(err)))
}

export function formatError(err: Error) {
  const errorObj = {
    ...err,
    message: err.message,
    stack: err.stack,
  }

  return process.env.NODE_ENV !== 'production' ? err : errorObj
}

export const getPercentage = (value: number, total: number, decimals = 2): string => {
  const definitelyANumber = value > 0 && total > 0 ? ((value * 100) / total).toFixed(decimals) : 0
  return `${definitelyANumber}%`
}
