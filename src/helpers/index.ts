import { FormatNumberOptions } from 'react-intl'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isURL from 'validator/lib/isURL'

import { DEFAULT_CHAIN_ID } from '../constants'
import { clientEnv } from '../utils/clientEnv'
import Time from '../utils/date/Time'
import logger from '../utils/logger'

import { toGovernancePathname } from './browser'

export const CURRENCY_FORMAT_OPTIONS = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
} as FormatNumberOptions

export function inBackground(fun: () => Promise<unknown>) {
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
  if (total === 0) return 0
  return Math.round((value * 100) / total)
}

export function getUrlFilters<T>(filterKey: string, params: URLSearchParams, value?: T) {
  if (typeof window === 'undefined') {
    return ''
  }

  const newParams = new URLSearchParams(params)
  value ? newParams.set(filterKey, String(value)) : newParams.delete(filterKey)
  newParams.delete('page')
  if (filterKey === 'type') {
    newParams.delete('subtype')
  }
  const stringParams = newParams.toString()
  const pathname = toGovernancePathname(location.pathname)
  return `${pathname}${stringParams === '' ? '' : '?' + stringParams}`
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function addressShortener(address: string) {
  if (!isEthereumAddress(address)) {
    return address
  }
  return address.substring(0, 6) + '...' + address.substring(38, 42)
}

export function openUrl(url: string, newTab = true) {
  window?.open(url, newTab ? '_blank' : '_self')?.focus()
}

export function capitalizeFirstLetter(string: string) {
  return string.length > 0 ? `${string[0].toUpperCase()}${string.slice(1)}` : ''
}

export function getVestingContractUrl(address: string) {
  const VESTING_DASHBOARD_URL = clientEnv('GATSBY_VESTING_DASHBOARD_URL')
  return VESTING_DASHBOARD_URL.replace('%23', '#').concat(address.toLowerCase())
}

export function splitArray<Type>(array: Type[], chunkSize: number): Type[][] {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize)
  )
}

export function getSupportedChainIds(): ChainId[] {
  return (DEFAULT_CHAIN_ID || '')
    .split(',')
    .filter(Boolean)
    .map((chainId) => Number(chainId))
}

export function getEnvironmentChainId() {
  const chainId = getSupportedChainIds()[0]
  switch (chainId) {
    case ChainId.ETHEREUM_MAINNET.valueOf():
      return ChainId.ETHEREUM_MAINNET
    case ChainId.ETHEREUM_GOERLI:
      return ChainId.ETHEREUM_GOERLI
    case ChainId.ETHEREUM_SEPOLIA:
      return ChainId.ETHEREUM_SEPOLIA
    default:
      throw new Error(`GATSBY_DEFAULT_CHAIN_ID is not a supported network: ${chainId}`)
  }
}

export function getEnumDisplayName<T extends { [key: string]: string | number }>(anyEnum: keyof T & string): string {
  if (!anyEnum) {
    return 'undefined'
  }
  return anyEnum.split('_').join(' ').toUpperCase()
}

export function validateYear(yearParam?: string | null) {
  if (yearParam) {
    const year = Time(`${yearParam}-01-01`).year()
    if (!isNaN(year)) return year

    return null
  }
  return null
}

export function validateQuarter(quarterParam?: string | null) {
  if (quarterParam) {
    const quarter = Number(quarterParam)
    if (quarter >= 1 && quarter <= 4) return quarter

    return null
  }
  return null
}

export function getQuarterDates(quarter?: number, year?: number) {
  if (!quarter && !year) {
    return { startDate: undefined, endDate: undefined }
  }

  if (!year) {
    console.error('Year is required')
    return { startDate: undefined, endDate: undefined }
  }

  if (!quarter) {
    const startDate = Time(`${year}-01-01`).format('YYYY-MM-DD')
    const endDate = Time(`${year}-12-31`).format('YYYY-MM-DD')
    return { startDate, endDate }
  }

  if (quarter < 1 || quarter > 4) {
    console.error('Quarter should be between 1 and 4')
    return { startDate: undefined, endDate: undefined }
  }

  const startMonth = (quarter - 1) * 3 + 1

  const endMonth = startMonth + 2

  const startDate = Time(`${year}-${startMonth}-01`).startOf('month').format('YYYY-MM-DD')
  const endDate = Time(`${year}-${endMonth}-01`).endOf('month').add(1, 'day').format('YYYY-MM-DD')

  return { startDate, endDate }
}

export function shortenText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}
