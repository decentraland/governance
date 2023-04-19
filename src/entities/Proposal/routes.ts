import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Discourse, DiscourseComment } from '../../clients/Discourse'
import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { inBackground } from '../../helpers'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { GrantsService } from '../../services/GrantsService'
import { ProposalInCreation, ProposalService } from '../../services/ProposalService'
import CoauthorModel from '../Coauthor/model'
import { CoauthorStatus } from '../Coauthor/types'
import isDAOCommittee from '../Committee/isDAOCommittee'
import { hasOpenSlots } from '../Committee/utils'
import DiscourseModel from '../Discourse/model'
import { filterComments } from '../Discourse/utils'
import { GrantRequest, getGrantRequestSchema } from '../Grant/types'
import { SNAPSHOT_DURATION } from '../Snapshot/constants'
import UpdateModel from '../Updates/model'
import { getVotes } from '../Votes/routes'

import { getUpdateMessage } from './templates/messages'

import { SUBMISSION_THRESHOLD_POLL } from './constants'
import ProposalModel from './model'
import {
  CategorizedGrants,
  GrantWithUpdate,
  HiringType,
  INVALID_PROPOSAL_POLL_OPTIONS,
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalHiring,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPoll,
  PoiType,
  ProposalAttributes,
  ProposalRequiredVP,
  ProposalStatus,
  ProposalType,
  UpdateProposalStatusProposal,
  newProposalBanNameScheme,
  newProposalCatalystScheme,
  newProposalDraftScheme,
  newProposalGovernanceScheme,
  newProposalHiringScheme,
  newProposalLinkedWearablesScheme,
  newProposalPOIScheme,
  newProposalPollScheme,
  updateProposalStatusScheme,
} from './types'
import {
  DEFAULT_CHOICES,
  MAX_PROPOSAL_LIMIT,
  MIN_PROPOSAL_OFFSET,
  canLinkProposal,
  getProposalEndDate,
  isAlreadyACatalyst,
  isAlreadyBannedName,
  isAlreadyPointOfInterest,
  isValidName,
  isValidPointOfInterest,
  isValidUpdateProposalStatus,
} from './utils'

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
  route.post('/proposals/hiring', withAuth, handleAPI(createProposalHiring))
  route.get('/proposals/grants', handleAPI(getGrants))
  route.get('/proposals/grants/:address', handleAPI(getGrantsByUser))
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(updateProposalStatus))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
  route.get('/proposals/:proposal/comments', handleAPI(proposalComments))
  route.get('/proposals/linked-wearables/image', handleAPI(checkImage))
})

export async function getProposals(req: WithAuth) {
  const query = req.query
  const type = query.type && String(query.type)
  const subtype = query.subtype && String(query.subtype)
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
      subtype,
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
      subtype,
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

const newProposalPollValidator = schema.compile(newProposalPollScheme)

export async function createProposalPoll(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPoll>(newProposalPollValidator, req.body || {})

  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_POLL)

  // add default options
  configuration.choices = [...configuration.choices, INVALID_PROPOSAL_POLL_OPTIONS]

  return createProposal({
    user,
    type: ProposalType.Poll,
    required_to_pass: ProposalRequiredVP[ProposalType.Poll],
    finish_at: getProposalEndDate(Number(process.env.GATSBY_DURATION_POLL)),
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
    finish_at: getProposalEndDate(Number(process.env.GATSBY_DURATION_DRAFT)),
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
    finish_at: getProposalEndDate(Number(process.env.GATSBY_DURATION_GOVERNANCE)),
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
    finish_at: getProposalEndDate(SNAPSHOT_DURATION),
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
    finish_at: getProposalEndDate(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalHiringValidator = schema.compile(newProposalHiringScheme)

export async function createProposalHiring(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalHiring>(newProposalHiringValidator, req.body || {})
  await validateSubmissionThreshold(user, process.env.GATSBY_SUBMISSION_THRESHOLD_HIRING)

  if (configuration.type === HiringType.Add) {
    const canHire = await hasOpenSlots(configuration.committee)
    if (!canHire) {
      throw new RequestError('The committee does not have available slots')
    }
  }

  if (!configuration.name) {
    const profile = await profiles.load(configuration.address)
    configuration.name = profile?.name || undefined
  }

  return createProposal({
    user,
    type: ProposalType.Hiring,
    required_to_pass: ProposalRequiredVP[ProposalType.Hiring],
    finish_at: getProposalEndDate(Number(process.env.GATSBY_DURATION_HIRING)),
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
    finish_at: getProposalEndDate(SNAPSHOT_DURATION),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

export async function createProposalGrant(req: WithAuth) {
  const grantRequestSchema = getGrantRequestSchema(req.body.category)
  const newProposalGrantValidator = schema.compile(grantRequestSchema)
  const user = req.auth!
  const grantRequest = validate<GrantRequest>(newProposalGrantValidator, req.body || {})
  const grantInCreation = await GrantsService.getGrantInCreation(grantRequest, user)
  return createProposal(grantInCreation)
}

const newProposalLinkedWearablesValidator = schema.compile(newProposalLinkedWearablesScheme)

export async function createProposalLinkedWearables(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalLinkedWearables>(newProposalLinkedWearablesValidator, req.body || {})

  return createProposal({
    user,
    type: ProposalType.LinkedWearables,
    required_to_pass: ProposalRequiredVP[ProposalType.LinkedWearables],
    finish_at: getProposalEndDate(SNAPSHOT_DURATION),
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
    const errorTitle = `Error creating proposal: ${JSON.stringify(proposalInCreation)}`
    ErrorService.report(errorTitle, e)
    throw new RequestError(
      `${errorTitle}\n 
    Error: ${e.message ? e.message : JSON.stringify(e)}`,
      RequestError.InternalServerError,
      e
    )
  }
}

export async function getProposal(req: Request<{ proposal: string }>) {
  const id = req.params.proposal
  try {
    return await ProposalService.getProposal(id)
  } catch (e) {
    throw new RequestError(`Proposal "${id}" not found`, RequestError.NotFound)
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
  if (!isDAOCommittee(user)) {
    throw new RequestError('Only DAO commitee members can enact a proposal', RequestError.Forbidden)
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
      await UpdateModel.createPendingUpdates(proposal.id, proposal.configuration.projectDuration)
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
    const filteredComments = await filterComments(allComments)

    const userIds = filteredComments.comments.reduce((set, comment) => {
      set.add(comment.id)
      return set
    }, new Set<number>())

    const users = await DiscourseModel.getAddressesByForumId(Array.from(userIds))
    const userMapping = users.reduce((map, user) => {
      map[user.forum_id] = user.address
      return map
    }, {} as Record<number, string>)

    filteredComments.comments = filteredComments.comments.map((comment) => {
      comment.address = userMapping[comment.id]
      return comment
    })

    return filteredComments
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
  if (!canLinkProposal(linkedProposal.status)) {
    throw new RequestError(
      "Cannot link selected proposal since it's not in a PASSED or OOB status",
      RequestError.Forbidden
    )
  }
}

async function validateSubmissionThreshold(user: string, submissionThreshold?: string) {
  const requiredVp = Number(submissionThreshold || SUBMISSION_THRESHOLD_POLL)
  const vpDistribution = await SnapshotGraphql.get().getVpDistribution(user)
  if (vpDistribution.total < requiredVp) {
    throw new RequestError(`User does not meet the required "${requiredVp}" VP`, RequestError.Forbidden)
  }
}

async function getGrants(): Promise<CategorizedGrants> {
  return await GrantsService.getGrants()
}

async function getGrantsByUser(req: Request): ReturnType<typeof getGrants> {
  const address = req.params.address
  const isCoauthoring = req.query.coauthor === 'true'
  if (!isEthereumAddress(address)) {
    throw new RequestError('Invalid address', RequestError.BadRequest)
  }

  let coauthoringProposalIds = new Set<string>()

  if (isCoauthoring) {
    const coauthoring = await CoauthorModel.findProposals(address, CoauthorStatus.APPROVED)
    coauthoringProposalIds = new Set(coauthoring.map((coauthoringAttributes) => coauthoringAttributes.proposal_id))
  }

  const grantsResult = await getGrants()

  const filterGrants = (grants: GrantWithUpdate[]) => {
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
