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
const SLOW_RESPONSE_TIME_THRESHOLD_IN_MS = 8000 // 8 seconds
const STATUS_CACHE_TIMEOUT_IN_SECONDS = 60 // 1 minute

export class SnapshotService {
  public static async getStatus(): Promise<SnapshotStatus | undefined> {
    try {
      const cachedStatus = CacheService.get<SnapshotStatus>('snapshotStatus')
      if (cachedStatus) {
        return cachedStatus
      }

      const snapshotStatus = await this.ping()
      CacheService.set('snapshotStatus', snapshotStatus, STATUS_CACHE_TIMEOUT_IN_SECONDS)

      logger.log('Snapshot status:', snapshotStatus)
      return snapshotStatus
    } catch (error) {
      ErrorService.report('Unable to determine snapshot status', { error, category: ErrorCategory.Snapshot })
      return undefined
    }
  }

  private static async ping(): Promise<SnapshotStatus> {
    const { status: graphQlStatus, addressesSample } = await this.pingGraphQl()
    const scoresStatus = await this.pingScores(addressesSample)
    return { scoresStatus, graphQlStatus }
  }

  private static async pingScores(addressesSample: string[]): Promise<ServiceStatus> {
    let scoresHealth = ServiceHealth.Normal
    const responseTime = await SnapshotApi.get().ping(addressesSample)
    if (responseTime === -1) {
      scoresHealth = ServiceHealth.Failing
    } else if (responseTime > SLOW_RESPONSE_TIME_THRESHOLD_IN_MS) {
      scoresHealth = ServiceHealth.Slow
    }
    return { health: scoresHealth, responseTime }
  }

  private static async pingGraphQl(): Promise<{ status: ServiceStatus; addressesSample: string[] }> {
    let health = ServiceHealth.Normal
    const { responseTime, addressesSample } = await SnapshotGraphql.get().ping()
    if (responseTime === -1) {
      health = ServiceHealth.Failing
    } else if (responseTime > SLOW_RESPONSE_TIME_THRESHOLD_IN_MS) {
      health = ServiceHealth.Slow
    }
    return { status: { health, responseTime }, addressesSample }
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
