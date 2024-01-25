import NodeCache from 'node-cache'

export const TTL_24_HS = 60 * 60 * 24
export const TTL_1_HS = 60 * 60

class CacheService {
  private static instance: CacheService
  private cache: NodeCache

  private constructor() {
    this.cache = new NodeCache()
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  public set<T>(key: string, data: T, ttlSeconds?: number) {
    ttlSeconds ? this.cache.set(key, data, ttlSeconds) : this.cache.set(key, data)
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }

  public remove(key: string) {
    return this.cache.del(key)
  }

  public flush() {
    this.cache.flushAll()
  }
}

export default CacheService.getInstance()
