import { createPool, Factory } from 'generic-pool'

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