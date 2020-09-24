import contracts from './contracts.json'
import { createPool, Factory } from 'generic-pool'

const addresses = new Map<string, string>([])
for (const contractMap of Object.values(contracts)) {
  for (const contractName of Object.keys(contractMap)) {
    addresses.set(contractMap[contractName as keyof typeof contractMap].toLowerCase(), contractName)
  }
}

export function getAddressName(address?: string) {
  return addresses.get(address?.toLowerCase() || '')
}

const factory: Factory<any> = {
  create: async () => () => null,
  destroy: async () => undefined
}
const pool = createPool(factory, { max: 3, min: 0 })

export function concurrent(fn: () => Promise<any>) {
  return async () => {
    const resource = await pool.acquire()
    try {
      const result = await fn()
      await pool.release(resource)
      return Promise.resolve(result)

    } catch (error) {
      pool.release(resource)
      return Promise.reject(error)
    }
  }
}

export function flatArray<T>(original: T[][]): T[] {
  return original.reduce((result, current) => result.concat(current), [] as T[])
}