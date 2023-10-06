import chalk from 'chalk'

import { SnapshotApi } from '../clients/SnapshotApi'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { ServiceHealth, ServiceStatus, SnapshotStatus, UNKNOWN_STATUS } from '../clients/SnapshotTypes'
import { SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD, SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE } from '../constants'
import { ErrorCategory } from '../utils/errorCategories'

import CacheService from './CacheService'
import { ErrorService } from './ErrorService'

const SNAPSHOT_STATUS_CACHE_KEY = 'SNAPSHOT_STATUS'

export class SnapshotStatusService {
  private static scoresRequestResults: boolean[] = []
  private static graphQlRequestResults: boolean[] = []

  public static async getStatus(): Promise<SnapshotStatus | undefined> {
    const cachedStatus = CacheService.get<SnapshotStatus>(SNAPSHOT_STATUS_CACHE_KEY)
    if (cachedStatus) {
      return cachedStatus
    }
    return { scoresStatus: UNKNOWN_STATUS, graphQlStatus: UNKNOWN_STATUS }
  }

  public static async ping() {
    try {
      const { status: graphQlStatus, addressesSample } = await this.measureGraphQlErrorRate()
      const scoresStatus = await this.measureScoresErrorRate(addressesSample)
      const snapshotStatus = { scoresStatus, graphQlStatus }
      CacheService.set(SNAPSHOT_STATUS_CACHE_KEY, snapshotStatus)
      this.logOnRecentError(snapshotStatus)
    } catch (error) {
      ErrorService.report('Unable to determine snapshot status', { error, category: ErrorCategory.Snapshot })
    }
  }

  private static async measureGraphQlErrorRate(): Promise<{ status: ServiceStatus; addressesSample: string[] }> {
    let requestSuccessful = true
    const { responseTime, addressesSample } = await SnapshotGraphql.get().ping()
    if (responseTime === -1) {
      requestSuccessful = false
    }
    this.graphQlRequestResults.push(requestSuccessful)
    const { errorRate, health } = this.calculateErrorRate(this.graphQlRequestResults)

    return { status: { health, responseTime, errorRate }, addressesSample }
  }

  private static async measureScoresErrorRate(addressesSample: string[]): Promise<ServiceStatus> {
    let requestSuccessful = true
    const responseTime = await SnapshotApi.get().ping(addressesSample)
    if (responseTime === -1) {
      requestSuccessful = false
    }
    this.scoresRequestResults.push(requestSuccessful)

    const { errorRate, health } = this.calculateErrorRate(this.scoresRequestResults)

    return { health, responseTime, errorRate }
  }

  private static calculateErrorRate(responsesBuffer: boolean[]) {
    if (responsesBuffer.length > SNAPSHOT_STATUS_MAX_ERROR_BUFFER_SIZE) {
      responsesBuffer.shift()
    }
    const errorRate = responsesBuffer.filter((requestSuccessful) => !requestSuccessful).length / responsesBuffer.length

    let health = ServiceHealth.Normal
    if (errorRate > SNAPSHOT_STATUS_ERROR_RATE_THRESHOLD) {
      health = ServiceHealth.Failing
    }
    return { errorRate, health }
  }

  private static visualizeRequestResults(requestResults: boolean[]) {
    const numRows = 1
    const numCols = requestResults.length
    const greenPoint = chalk.green('●')
    const redPoint = chalk.red('●')
    let matrix = ''
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const index = i * numCols + j
        if (index < requestResults.length) {
          const result = requestResults[index]
          matrix += result ? greenPoint : redPoint
        } else {
          matrix += ' '
        }
        matrix += ' '
      }
      matrix += '\n'
    }
    console.log(matrix)
  }

  private static logOnRecentError(snapshotStatus: SnapshotStatus) {
    if (this.scoresRequestResults.includes(false) || this.graphQlRequestResults.includes(false)) {
      console.log('\u26A1', 'Snapshot Status', '\u26A1')
      console.log('Scores: ', JSON.stringify(snapshotStatus.scoresStatus))
      this.visualizeRequestResults(this.scoresRequestResults)
      console.log('GraphQl: ', JSON.stringify(snapshotStatus.graphQlStatus))
      this.visualizeRequestResults(this.graphQlRequestResults)
    }
  }
}
