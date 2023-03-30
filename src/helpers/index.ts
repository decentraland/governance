import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import isURL from 'validator/lib/isURL'

export const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}

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

export const getFormattedPercentage = (value: number, total: number, decimals = 2): string => {
  const formattedNumber = value > 0 && total > 0 ? ((value * 100) / total).toFixed(decimals) : 0
  return `${formattedNumber}%`
}

export const getRoundedPercentage = (value: number, total: number) => Math.min(Math.round((value * 100) / total), 100)

export function getUncappedRoundedPercentage(value: number, total: number): number {
  return Math.round((value * 100) / total)
}

export function getUrlFilters<T>(filterKey: string, params: URLSearchParams, value?: T) {
  const newParams = new URLSearchParams(params)
  value ? newParams.set(filterKey, String(value)) : newParams.delete(filterKey)
  newParams.delete('page')
  if (filterKey === 'type') {
    newParams.delete('subtype')
  }
  const stringParams = newParams.toString()
  return `${location.pathname}${stringParams === '' ? '' : '?' + stringParams}`
}

export const fetchWithTimeout = async (url: string, timeout = 10000, options?: RequestInit) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

export const isHttpsURL = (url: string) => isURL(url, { protocols: ['https'], require_protocol: true })

export function disableOnWheelInput(event: any) {
  // Prevent the input value change
  event.target.blur()

  // Prevent the page/container scrolling
  event.stopPropagation()

  // Refocus immediately, on the next tick (after the current function is done)
  setTimeout(() => {
    event.target.focus()
  }, 0)
}
