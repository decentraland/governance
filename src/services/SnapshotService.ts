import chalk from 'chalk'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import isNumber from 'lodash/isNumber'

import { SnapshotApi, SnapshotReceipt } from '../clients/SnapshotApi'
import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import {
  DetailedScores,
  ServiceHealth,
  ServiceStatus,
  SnapshotProposal,
  SnapshotStatus,
  SnapshotVote,
  UNKNOWN_STATUS,
  VpDistribution,
} from '../clients/SnapshotTypes'
import * as templates from '../entities/Proposal/templates'
import { proposalUrl, snapshotProposalUrl } from '../entities/Proposal/utils'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import { inBackground } from '../helpers'
import { Avatar } from '../utils/Catalyst/types'
import { ErrorCategory } from '../utils/errorCategories'

import CacheService from './CacheService'
import { ErrorService } from './ErrorService'
import { ProposalInCreation, ProposalLifespan } from './ProposalService'
import RpcService from './RpcService'

const DELEGATION_STRATEGY_NAME = 'delegation'
const SNAPSHOT_STATUS_CACHE_KEY = 'SNAPSHOT_STATUS'
const MAX_ERROR_BUFFER_SIZE = 30
const SERVICE_FAILURE_ERROR_RATE_THRESHOLD = 0.25

export class SnapshotService {
  private static scoresRequestResults: boolean[] = []
  private static graphQlRequestResults: boolean[] = []

  public static async getStatus(): Promise<SnapshotStatus | undefined> {
    const cachedStatus = CacheService.get<SnapshotStatus>(SNAPSHOT_STATUS_CACHE_KEY)
    if (cachedStatus) {
      return cachedStatus
    }
    return { scoresStatus: UNKNOWN_STATUS, graphQlStatus: UNKNOWN_STATUS }
  }

  private static visualizeRequestResults(requestResults: boolean[]) {
    const numRows = 6
    const numCols = 5
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

  public static async ping() {
    try {
      const { status: graphQlStatus, addressesSample } = await this.measureGraphQlErrorRate()
      const scoresStatus = await this.measureScoresErrorRate(addressesSample)
      const snapshotStatus = { scoresStatus, graphQlStatus }
      CacheService.set(SNAPSHOT_STATUS_CACHE_KEY, snapshotStatus)
      if (this.scoresRequestResults.some((result) => !result) || this.graphQlRequestResults.some((result) => !result)) {
        console.log('\u26A1', 'Snapshot Status', '\u26A1')
        console.log('Scores: ', JSON.stringify(snapshotStatus.scoresStatus))
        this.visualizeRequestResults(this.scoresRequestResults)
        console.log('GraphQl: ', JSON.stringify(snapshotStatus.graphQlStatus))
        this.visualizeRequestResults(this.graphQlRequestResults)
        logger.log('Snapshot status:', snapshotStatus)
      }
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
    if (responsesBuffer.length > MAX_ERROR_BUFFER_SIZE) {
      responsesBuffer.shift()
    }
    const errorRate = responsesBuffer.filter((requestSuccessful) => !requestSuccessful).length / responsesBuffer.length

    let health = ServiceHealth.Normal
    if (errorRate > SERVICE_FAILURE_ERROR_RATE_THRESHOLD) {
      health = ServiceHealth.Failing
    }
    return { errorRate, health }
  }

  static async createProposal(
    proposalInCreation: ProposalInCreation,
    proposalId: string,
    profile: Avatar | null,
    proposalLifespan: ProposalLifespan
  ) {
    const blockNumber: number = await RpcService.getBlockNumber()
    const { proposalTitle, proposalBody } = await this.getProposalTitleAndBody(proposalInCreation, profile, proposalId)

    const proposalCreationReceipt: SnapshotReceipt = await SnapshotApi.get().createProposal(
      proposalInCreation,
      proposalTitle,
      proposalBody,
      proposalLifespan,
      blockNumber
    )

    const snapshotId = proposalCreationReceipt.id
    const snapshotUrl = snapshotProposalUrl({
      snapshot_space: SNAPSHOT_SPACE,
      snapshot_id: snapshotId,
    })

    logger.log('Snapshot proposal created', {
      snapshot_url: snapshotUrl,
      snapshot_proposal: JSON.stringify(proposalCreationReceipt),
    })

    const snapshotContent = await this.getProposalContent(snapshotId)
    return { snapshotId, snapshotUrl, snapshotContent }
  }

  private static async getProposalTitleAndBody(
    proposalInCreation: ProposalInCreation,
    profile: Avatar | null,
    proposalId: string
  ) {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: proposalInCreation.user,
      type: proposalInCreation.type,
      configuration: proposalInCreation.configuration,
      profile,
      proposal_url: proposalUrl(proposalId),
    }

    const proposalTitle = templates.snapshotTitle(snapshotTemplateProps)
    const proposalBody = await templates.snapshotDescription(snapshotTemplateProps)
    return { proposalTitle, proposalBody }
  }

  private static async getProposalContent(snapshotId: string) {
    try {
      return await SnapshotGraphql.get().getProposalContent(snapshotId)
    } catch (err: any) {
      SnapshotService.dropSnapshotProposal(snapshotId)
      throw new Error("Couldn't retrieve proposal content: " + err.message, err)
    }
  }

  static dropSnapshotProposal(snapshotId: string) {
    inBackground(async () => {
      logger.log(`Dropping snapshot proposal: ${snapshotId}`)
      const result = await SnapshotApi.get().removeProposal(snapshotId)
      return {
        proposalId: snapshotId,
        result,
      }
    })
  }

  static async getConfig(spaceName = SNAPSHOT_SPACE) {
    const [config, space] = await Promise.all([
      await SnapshotGraphql.get().getConfig(),
      await SnapshotGraphql.get().getSpace(spaceName),
    ])
    if (!space) {
      throw new Error(`Couldn't find snapshot space ${spaceName}. 
      \nSnapshot response: ${JSON.stringify(space)}
      \nSnapshot config: ${JSON.stringify(config)}`)
    }
    return { config, space }
  }

  static async getAddressesVotes(addresses: string[], first?: number, skip?: number) {
    if (isNumber(first) && isNumber(skip)) {
      return await SnapshotGraphql.get().getAddressesVotesInBatches(addresses, first, skip)
    }
    return await SnapshotGraphql.get().getAddressesVotes(addresses)
  }

  static async getProposalVotes(proposalSnapshotId: string): Promise<SnapshotVote[]> {
    return await SnapshotGraphql.get().getProposalVotes(proposalSnapshotId)
  }

  static async getAllVotesBetweenDates(start: Date, end: Date): Promise<SnapshotVote[]> {
    return await SnapshotGraphql.get().getAllVotesBetweenDates(start, end)
  }

  static async getProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    return await SnapshotGraphql.get().getProposals(start, end, fields)
  }

  static async getPendingProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[], limit: number) {
    return await SnapshotGraphql.get().getPendingProposals(start, end, fields, limit)
  }

  static async getVpDistribution(address: string, proposalSnapshotId?: string): Promise<VpDistribution> {
    return await SnapshotGraphql.get().getVpDistribution(address, proposalSnapshotId)
  }

  static async getScores(addresses: string[]) {
    const formattedAddresses = addresses.map((addr) => addr.toLowerCase())
    const { scores, strategies } = await SnapshotApi.get().getScores(formattedAddresses)

    const result: DetailedScores = {}
    const delegationScores = scores[strategies.findIndex((s) => s.name === DELEGATION_STRATEGY_NAME)] || {}
    for (const addr of formattedAddresses) {
      result[addr] = {
        ownVp: 0,
        delegatedVp:
          Math.round(delegationScores[Object.keys(delegationScores).find((key) => isSameAddress(key, addr)) || '']) ||
          0,
        totalVp: 0,
      }
    }

    for (const score of scores) {
      for (const addr of Object.keys(score)) {
        const address = addr.toLowerCase()
        result[address].totalVp = (result[address].totalVp || 0) + Math.floor(score[addr] || 0)
      }
    }

    for (const address of Object.keys(result)) {
      result[address].ownVp = result[address].totalVp - result[address].delegatedVp
    }

    return result
  }

  static async getProposalScores(proposalSnapshotId: string): Promise<number[]> {
    return await SnapshotGraphql.get().getProposalScores(proposalSnapshotId)
  }
}
