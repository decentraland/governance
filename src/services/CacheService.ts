import NodeCache from 'node-cache'

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

  set(key: string, data: any, ttlSeconds?: number) {
    ttlSeconds ? this.cache.set(key, data, ttlSeconds) : this.cache.set(key, data)
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key)
  }
}

export default CacheService.getInstance()
