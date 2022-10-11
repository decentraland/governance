import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { Request } from 'express'
import { filter, isNil } from 'lodash'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { DclData, TransparencyGrantsTiers } from '../../clients/DclData'
import { Discourse, DiscourseComment } from '../../clients/Discourse'
import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { formatError, inBackground } from '../../helpers'
import { DiscourseService } from '../../services/DiscourseService'
import { ProposalInCreation, ProposalService } from '../../services/ProposalService'
import CoauthorModel from '../Coauthor/model'
import { CoauthorStatus } from '../Coauthor/types'
import isCommittee from '../Committee/isCommittee'
import { filterComments } from '../Discourse/utils'
import { SNAPSHOT_DURATION } from '../Snapshot/constants'
import UpdateModel from '../Updates/model'
import { IndexedUpdate, UpdateAttributes } from '../Updates/types'
import { getPublicUpdates } from '../Updates/utils'
import { getVotes } from '../Votes/routes'

import { getUpdateMessage } from './templates/messages'

import ProposalModel from './model'
import {
  GrantAttributes,
  GrantRequiredVP,
  GrantWithUpdateAttributes,
  INVALID_PROPOSAL_POLL_OPTIONS,
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalGrant,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPoll,
  PoiType,
  ProposalAttributes,
  ProposalGrantTier,
  ProposalRequiredVP,
  ProposalStatus,
  ProposalType,
  UpdateProposalStatusProposal,
  newProposalBanNameScheme,
  newProposalCatalystScheme,
  newProposalDraftScheme,
  newProposalGovernanceScheme,
  newProposalGrantScheme,
  newProposalLinkedWearablesScheme,
  newProposalPOIScheme,
  newProposalPollScheme,
  updateProposalStatusScheme,
} from './types'
import {
  DEFAULT_CHOICES,
  GrantDuration,
  MAX_PROPOSAL_LIMIT,
  MIN_PROPOSAL_OFFSET,
  isAlreadyACatalyst,
  isAlreadyBannedName,
  isAlreadyPointOfInterest,
  isGrantSizeValid,
  isValidName,
  isValidPointOfInterest,
  isValidUpdateProposalStatus,
} from './utils'

const POLL_SUBMISSION_THRESHOLD = requiredEnv('GATSBY_SUBMISSION_THRESHOLD_POLL')

export default routes((route) => {
  const withAuth = auth()
  const withOptionalAuth = auth({ optional: true })
  route.get('/proposals', withOptionalAuth, handleJSON(getProposals))
  route.post('/proposals/poll', withAuth, handleAPI(createProposalPoll))
  route.post('/proposals/draft', withAuth, handleAPI(createProposalDraft))
  route.post('/proposals/governance', withAuth, handleAPI(createProposalGovernance))
  route.post('/proposals/ban-name', withAuth, handleAPI(createProposalBanName))
  route.post('/proposals/poi', withAuth, handleAPI(createProposalPOI))
  route.post('/proposals/catalyst', withAuth, handleAPI(createProposalCatalyst))
  route.post('/proposals/grant', withAuth, handleAPI(createProposalGrant))
  route.post('/proposals/linked-wearables', withAuth, handleAPI(createProposalLinkedWearables))
  route.get('/proposals/grants', handleAPI(getGrants))
  route.get('/proposals/grants/:address', handleAPI(getGrantsByUser))
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(updateProposalStatus))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
  route.get('/proposals/:proposal/comments', handleAPI(proposalComments))
  route.get('/proposals/linked-wearables/image', handleAPI(checkImage))
})

export async function getProposals(req: WithAuth<Request>) {
  const query = req.query
  const type = query.type && String(query.type)
  const status = query.status && String(query.status)
  const user = query.user && String(query.user)
  const search = query.search && String(query.search)
  const timeFrame = query.timeFrame && String(query.timeFrame)
  const timeFrameKey = query.timeFrameKey && String(query.timeFrameKey)
  const coauthor = (query.coauthor && Boolean(query.coauthor)) || false
  const order = query.order && String(query.order) === 'ASC' ? 'ASC' : 'DESC'
  const snapshotIds = query.snapshotIds && String(query.snapshotIds)

  let subscribed: string | undefined = undefined
  if (query.subscribed) {
    subscribed = req.auth || ''
  }

  const offset = query.offset && Number.isFinite(Number(query.offset)) ? Number(query.offset) : MIN_PROPOSAL_OFFSET

  const limit = query.limit && Number.isFinite(Number(query.limit)) ? Number(query.limit) : MAX_PROPOSAL_LIMIT

  if (search && !/\w{2}/.test(search)) {
    return []
  }

  const [total, data] = await Promise.all([
    ProposalModel.getProposalTotal({
      type,
      status,
      user,
      search,
      timeFrame,
      timeFrameKey,
      subscribed,
      coauthor,
      snapshotIds,
    }),
    ProposalModel.getProposalList({
      type,
      status,
      user,
      subscribed,
      coauthor,
      search,
      timeFrame,
      timeFrameKey,
      order,
      offset,
      limit,
      snapshotIds,
    }),
  ])

  return { ok: true, total, data }
}

function proposalDuration(duration: number) {
  return Time.utc().set('seconds', 0).add(duration, 'seconds').toDate()
}

const newProposalPollValidator = schema.compile(newProposalPollScheme)

export async function createProposalPoll(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPoll>(newProposalPollValidator, req.body || {})

  await validateSubmissionThreshold(user, POLL_SUBMISSION_THRESHOLD)

  // add default options
  configuration.choices = [...configuration.choices, INVALID_PROPOSAL_POLL_OPTIONS]

  return createProposal({
    user,
    type: ProposalType.Poll,
    required_to_pass: ProposalRequiredVP[ProposalType.Poll],
    finish_at: proposalDuration(Number(process.env.GATSBY_DURATION_POLL)),
    configuration,
  })
}

const newProposalDraftValidator = schema.compile(newProposalDraftScheme)

export async function createProposalDraft(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalDraft>(newProposalDraftValidator, req.body || {})

  await validateLinkedProposal(configuration.linked_proposal_id, ProposalType.Poll)
  await validateSubmissionThreshold(user, process.env.GATSBY_SUBMISSION_THRESHOLD_DRAFT)

  return createProposal({
    user,
    type: ProposalType.Draft,
    required_to_pass: ProposalRequiredVP[ProposalType.Draft],
    finish_at: proposalDuration(Number(process.env.GATSBY_DURATION_DRAFT)),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalGovernanceValidator = schema.compile(newProposalGovernanceScheme)

export async function createProposalGovernance(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalGovernance>(newProposalGovernanceValidator, req.body || {})

  await validateLinkedProposal(configuration.linked_proposal_id, ProposalType.Draft)
  await validateSubmissionThreshold(user, process.env.GATSBY_SUBMISSION_THRESHOLD_GOVERNANCE)

  return createProposal({
    user,
    type: ProposalType.Governance,
    required_to_pass: ProposalRequiredVP[ProposalType.Governance],
    finish_at: proposalDuration(Number(process.env.GATSBY_DURATION_GOVERNANCE)),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalBanNameValidator = schema.compile(newProposalBanNameScheme)

export async function createProposalBanName(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalBanName>(newProposalBanNameValidator, req.body || {})
  const validName = isValidName(configuration.name)
  if (!validName) {
    throw new RequestError('Name is not valid')
  }

  const alreadyBanned = await isAlreadyBannedName(configuration.name)
  if (alreadyBanned) {
    throw new RequestError('Name is already banned')
  }

  return createProposal({
    user,
    type: ProposalType.BanName,
    required_to_pass: ProposalRequiredVP[ProposalType.BanName],
    finish_at: proposalDuration(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalPOIValidator = schema.compile(newProposalPOIScheme)
type VerifyFunction = (config: NewProposalPOI) => Promise<void>

const verify: VerifyFunction = async (config: NewProposalPOI) => {
  const alreadyPointOfInterest = await isAlreadyPointOfInterest(config.x, config.y)

  if (config.type === PoiType.AddPOI) {
    if (alreadyPointOfInterest) {
      throw new RequestError(
        `Coordinate "${config.x},${config.y}" is already a point of interest`,
        RequestError.BadRequest
      )
    }

    const validPointOfInterest = await isValidPointOfInterest(config.x, config.y)
    if (!validPointOfInterest) {
      throw new RequestError(
        `Coodinate "${config.x},${config.y}" is not valid as point of interest`,
        RequestError.BadRequest
      )
    }
  } else if (config.type === PoiType.RemovePOI) {
    if (!alreadyPointOfInterest) {
      throw new RequestError(`Coordinate "${config.x},${config.y}" is not a point of interest`, RequestError.BadRequest)
    }
  } else {
    throw new RequestError(`"${config.type}" is an invalid type`, RequestError.BadRequest)
  }
}

export async function createProposalPOI(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPOI>(newProposalPOIValidator, req.body || {})

  await verify(configuration)

  return createProposal({
    user,
    type: ProposalType.POI,
    required_to_pass: ProposalRequiredVP[ProposalType.POI],
    finish_at: proposalDuration(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalCatalystValidator = schema.compile(newProposalCatalystScheme)

export async function createProposalCatalyst(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalCatalyst>(newProposalCatalystValidator, req.body || {})
  const alreadyCatalyst = await isAlreadyACatalyst(configuration.domain)
  if (alreadyCatalyst) {
    throw new RequestError('Domain is already a catalyst')
  }

  return createProposal({
    user,
    type: ProposalType.Catalyst,
    required_to_pass: ProposalRequiredVP[ProposalType.Catalyst],
    finish_at: proposalDuration(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalGrantValidator = schema.compile(newProposalGrantScheme)

export async function createProposalGrant(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalGrant>(newProposalGrantValidator, req.body || {})

  if (!isGrantSizeValid(configuration.tier, configuration.size)) {
    throw new RequestError('Grant size is not valid for the selected tier')
  }

  return createProposal({
    user,
    type: ProposalType.Grant,
    required_to_pass: GrantRequiredVP[configuration.tier],
    finish_at: proposalDuration(GrantDuration[configuration.tier]),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalLinkedWearablesValidator = schema.compile(newProposalLinkedWearablesScheme)

export async function createProposalLinkedWearables(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalLinkedWearables>(newProposalLinkedWearablesValidator, req.body || {})

  return createProposal({
    user,
    type: ProposalType.LinkedWearables,
    required_to_pass: ProposalRequiredVP[ProposalType.LinkedWearables],
    finish_at: proposalDuration(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

export async function createProposal(proposalInCreation: ProposalInCreation) {
  try {
    return await ProposalService.createProposal(proposalInCreation)
  } catch (e: any) {
    throw new RequestError(
      `Error creating proposal: ${JSON.stringify(proposalInCreation)}\n 
      Error: ${e.message ? e.message : JSON.stringify(e)}`,
      RequestError.InternalServerError,
      e
    )
  }
}

export async function getProposal(req: Request<{ proposal: string }>) {
  try {
    return ProposalModel.getProposal(req.params.proposal)
  } catch (e: any) {
    throw new RequestError(e.message, RequestError.NotFound)
  }
}

const updateProposalStatusValidator = schema.compile(updateProposalStatusScheme)

export function commentProposalUpdateInDiscourse(id: string) {
  inBackground(async () => {
    const updatedProposal: ProposalAttributes | undefined = await ProposalModel.findOne<ProposalAttributes>({ id })
    if (!updatedProposal) {
      logger.error('Invalid proposal id for discourse update', { id: id })
      return
    }
    const votes = await getVotes(updatedProposal.id)
    const updateMessage = getUpdateMessage(updatedProposal, votes)
    const discourseComment: DiscourseComment = {
      topic_id: updatedProposal.discourse_topic_id,
      raw: updateMessage,
      created_at: new Date().toJSON(),
    }
    await Discourse.get().commentOnPost(discourseComment)
  })
}

export async function updateProposalStatus(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const id = req.params.proposal
  if (!isCommittee(user)) {
    throw new RequestError('Only commitee members can enact a proposal', RequestError.Forbidden)
  }

  const proposal = await getProposal(req)
  const configuration = validate<UpdateProposalStatusProposal>(updateProposalStatusValidator, req.body || {})
  if (!isValidUpdateProposalStatus(proposal.status, configuration.status)) {
    throw new RequestError(
      `${proposal.status} can't be updated to ${configuration.status}`,
      RequestError.BadRequest,
      configuration
    )
  }

  const update: Partial<ProposalAttributes> = {
    status: configuration.status,
    updated_at: new Date(),
  }

  if (update.status === ProposalStatus.Enacted) {
    update.enacted = true
    update.enacted_by = user
    update.enacted_description = configuration.description || null
    if (proposal.type == ProposalType.Grant) {
      update.vesting_address = configuration.vesting_address
      update.enacting_tx = configuration.enacting_tx
      update.textsearch = ProposalModel.textsearch(
        proposal.title,
        proposal.description,
        proposal.user,
        update.vesting_address
      )
    }
  } else if (update.status === ProposalStatus.Passed) {
    update.passed_by = user
    update.passed_description = configuration.description || null
    if (proposal.type == ProposalType.Grant) {
      await UpdateModel.createPendingUpdates(proposal.id, proposal.configuration.tier)
    }
  } else if (update.status === ProposalStatus.Rejected) {
    update.rejected_by = user
    update.rejected_description = configuration.description || null
  }

  await ProposalModel.update<ProposalAttributes>(update, { id })

  commentProposalUpdateInDiscourse(id)

  return {
    ...proposal,
    ...update,
  }
}

export async function removeProposal(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const updated_at = new Date()
  const id = req.params.proposal
  const proposal = await getProposal(req)

  return await ProposalService.removeProposal(proposal, user, updated_at, id)
}

export async function proposalComments(req: Request<{ proposal: string }>) {
  const proposal = await getProposal(req)
  try {
    const allComments = await DiscourseService.fetchAllComments(proposal.discourse_topic_id)
    return filterComments(allComments)
  } catch (e) {
    console.error(
      `Error while fetching discourse topic ${proposal.discourse_topic_id}: for proposal ${proposal.id} `,
      e as Error
    )
    return []
  }
}

async function validateLinkedProposal(linkedProposalId: string, expectedProposalType: ProposalType) {
  const linkedProposal = await ProposalModel.findOne<ProposalAttributes>({
    id: linkedProposalId,
    type: expectedProposalType,
    deleted: false,
  })
  if (!linkedProposal) {
    throw new RequestError(
      `Could not find a matching ${expectedProposalType} proposal for "${linkedProposalId}"`,
      RequestError.NotFound
    )
  }
  if (linkedProposal.status != ProposalStatus.Passed) {
    throw new RequestError("Cannot link selected proposal since it's not in a PASSED status", RequestError.Forbidden)
  }
}

async function validateSubmissionThreshold(user: string, submissionThreshold?: string) {
  const requiredVp = Number(submissionThreshold || POLL_SUBMISSION_THRESHOLD)
  const vpDistribution = await SnapshotGraphql.get().getVpDistribution(user)
  if (vpDistribution.total < requiredVp) {
    throw new RequestError(`User does not meet the required "${requiredVp}" VP`, RequestError.Forbidden)
  }
}

async function getGrantLatestUpdate(tier: ProposalGrantTier, proposalId: string): Promise<IndexedUpdate | null> {
  const updates = await UpdateModel.find<UpdateAttributes>({ proposal_id: proposalId }, {
    created_at: 'desc',
  } as never)
  if (!updates || updates.length === 0) {
    return null
  }

  if (tier === ProposalGrantTier.Tier1 || tier === ProposalGrantTier.Tier2) {
    return { ...updates[0], index: updates.length }
  }

  const publicUpdates = getPublicUpdates(updates)
  const currentUpdate = publicUpdates[0]
  if (!currentUpdate) {
    return null
  }

  return { ...currentUpdate, index: publicUpdates.length }
}

async function getGrants() {
  const grants = await DclData.get().getGrants()
  const enactedGrants = filter(grants, (item) => item.status === ProposalStatus.Enacted)

  const current: GrantAttributes[] = []
  const past: GrantAttributes[] = []

  await Promise.all(
    enactedGrants.map(async (grant) => {
      if (!grant.vesting_address && !grant.enacting_tx) {
        return
      }

      try {
        const proposal = await ProposalModel.findOne<ProposalAttributes>(grant.id)

        if (!proposal) {
          throw new Error('Proposal not found')
        }

        const newGrant: GrantAttributes = {
          id: grant.id,
          size: grant.size,
          configuration: {
            category: grant.category,
            tier: grant.tier,
          },
          user: grant.user,
          title: grant.title,
          token: grant.token,
          created_at: Time(proposal.created_at).unix(),
          enacted_at: grant.tx_date ? Time(grant.tx_date).unix() : Time(grant.vesting_start_at).unix(),
        }

        if (grant.tx_date) {
          Object.assign(newGrant, {
            enacting_tx: grant.enacting_tx,
            tx_amount: grant.tx_amount,
          })
        } else {
          const { vesting_total_amount, vesting_released, vesting_releasable } = grant

          if (isNil(vesting_total_amount) || isNil(vesting_released) || isNil(vesting_releasable)) {
            throw new Error('Missing vesting data')
          }

          Object.assign(newGrant, {
            contract: {
              vesting_total_amount: Math.round(vesting_total_amount),
              vestedAmount: Math.round(vesting_released + vesting_releasable),
              releasable: Math.round(vesting_releasable),
              released: Math.round(vesting_released),
              start_at: Time(grant.vesting_start_at).unix(),
              finish_at: Time(grant.vesting_finish_at).unix(),
            },
          })
        }

        const oneTimePaymentThreshold = Time(grant.tx_date).add(1, 'month')
        const isCurrentGrant =
          grant.tier === 'Tier 1' || grant.tier === 'Tier 2'
            ? Time().isBefore(oneTimePaymentThreshold)
            : newGrant.contract?.vestedAmount !== newGrant.contract?.vesting_total_amount

        if (!isCurrentGrant) {
          return past.push(newGrant)
        }

        try {
          const update = await getGrantLatestUpdate(TransparencyGrantsTiers[grant.tier], grant.id)
          return current.push({
            ...newGrant,
            update,
            update_timestamp: update?.completion_date ? Time(update?.completion_date).unix() : 0,
          } as GrantWithUpdateAttributes)
        } catch (error) {
          logger.error(`Failed to fetch grant update data from proposal ${grant.id}`, formatError(error as Error))
        }
      } catch (error) {
        logger.error(`Failed to fetch proposal ${grant.id}`, formatError(error as Error))
      }
    })
  )

  return {
    current,
    past,
    total: grants.length,
  }
}

async function getGrantsByUser(req: Request): ReturnType<typeof getGrants> {
  const address = req.params.address
  const isCoauthoring = req.query.coauthoring === 'true'
  if (!isEthereumAddress(address)) {
    throw new RequestError('Invalid address', RequestError.BadRequest)
  }

  let coauthoringProposalIds = new Set<string>()

  if (isCoauthoring) {
    const coauthoring = await CoauthorModel.findProposals(address, CoauthorStatus.APPROVED)
    coauthoringProposalIds = new Set(coauthoring.map((coauthoringAttributes) => coauthoringAttributes.proposal_id))
  }

  const grantsResult = await getGrants()

  const filterGrants = (grants: GrantAttributes[]) => {
    return grants.filter(
      (grant) => grant.user.toLowerCase() === address.toLowerCase() || coauthoringProposalIds.has(grant.id)
    )
  }

  const current = filterGrants(grantsResult.current)
  const past = filterGrants(grantsResult.past)

  return {
    current,
    past,
    total: current.length + past.length,
  }
}

async function checkImage(req: Request) {
  const imageUrl = req.query.url as string
  const allowedImageTypes = new Set(['image/bmp', 'image/jpeg', 'image/png', 'image/webp'])

  return new Promise<boolean>((resolve) => {
    fetch(imageUrl)
      .then((response) => {
        const mime = response.headers.get('content-type')
        resolve(!!mime && allowedImageTypes.has(mime))
      })
      .catch((error) => {
        logger.error('Fetching image error', error)
        resolve(false)
      })
  })
}
