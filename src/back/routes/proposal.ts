import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { getVestingContractData } from '../../clients/VestingData'
import { BidRequest, BidRequestSchema } from '../../entities/Bid/types'
import CoauthorModel from '../../entities/Coauthor/model'
import { CoauthorStatus } from '../../entities/Coauthor/types'
import isDAOCommittee from '../../entities/Committee/isDAOCommittee'
import { hasOpenSlots } from '../../entities/Committee/utils'
import { GrantRequest, getGrantRequestSchema } from '../../entities/Grant/types'
import {
  SUBMISSION_THRESHOLD_DRAFT,
  SUBMISSION_THRESHOLD_GOVERNANCE,
  SUBMISSION_THRESHOLD_GRANT,
  SUBMISSION_THRESHOLD_HIRING,
  SUBMISSION_THRESHOLD_PITCH,
  SUBMISSION_THRESHOLD_POLL,
  SUBMISSION_THRESHOLD_TENDER,
} from '../../entities/Proposal/constants'
import ProposalModel from '../../entities/Proposal/model'
import {
  CatalystType,
  CategorizedGrants,
  HiringType,
  INVALID_PROPOSAL_POLL_OPTIONS,
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalHiring,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPitch,
  NewProposalPoll,
  NewProposalTender,
  PoiType,
  ProjectWithUpdate,
  ProposalAttributes,
  ProposalCommentsInDiscourse,
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
  newProposalPitchScheme,
  newProposalPollScheme,
  newProposalTenderScheme,
  updateProposalStatusScheme,
} from '../../entities/Proposal/types'
import {
  DEFAULT_CHOICES,
  MAX_PROPOSAL_LIMIT,
  MIN_PROPOSAL_OFFSET,
  canLinkProposal,
  getProposalEndDate,
  hasTenderProcessFinished,
  hasTenderProcessStarted,
  isAlreadyACatalyst,
  isAlreadyBannedName,
  isAlreadyPointOfInterest,
  isValidName,
  isValidPointOfInterest,
  isValidUpdateProposalStatus,
} from '../../entities/Proposal/utils'
import { SNAPSHOT_DURATION } from '../../entities/Snapshot/constants'
import { validateUniqueAddresses } from '../../entities/Transparency/utils'
import UpdateModel from '../../entities/Updates/model'
import BidService from '../../services/BidService'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { ProjectService } from '../../services/ProjectService'
import { ProposalInCreation, ProposalService } from '../../services/ProposalService'
import { getProfile } from '../../utils/Catalyst'
import Time from '../../utils/date/Time'
import { ErrorCategory } from '../../utils/errorCategories'
import { NotificationService } from '../services/notification'
import { validateAddress, validateProposalId } from '../utils/validations'

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
  route.post('/proposals/pitch', withAuth, handleAPI(createProposalPitch))
  route.post('/proposals/tender', withAuth, handleAPI(createProposalTender))
  route.post('/proposals/bid', withAuth, handleAPI(createProposalBid))
  route.post('/proposals/hiring', withAuth, handleAPI(createProposalHiring))
  route.get('/proposals/grants', handleAPI(getGrants)) // TODO: Deprecate
  route.get('/proposals/grants/:address', handleAPI(getGrantsByUser)) // TODO: Deprecate
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(updateProposalStatus))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
  route.get('/proposals/:proposal/comments', handleAPI(getProposalComments))
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
  const subscribed = query.subscribed ? req.auth || '' : undefined
  const offset = query.offset && Number.isFinite(Number(query.offset)) ? Number(query.offset) : MIN_PROPOSAL_OFFSET
  const limit = query.limit && Number.isFinite(Number(query.limit)) ? Number(query.limit) : MAX_PROPOSAL_LIMIT
  const linkedProposalId = isUUID(String(query.linkedProposalId)) ? String(query.linkedProposalId) : undefined

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
      linkedProposalId,
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
      linkedProposalId,
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
  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_DRAFT)

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
  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_GOVERNANCE)

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

  const alreadyBanned = isAlreadyBannedName(configuration.name)
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
        `Coordinate "${config.x},${config.y}" is not valid as point of interest`,
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
  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_HIRING)

  if (configuration.type === HiringType.Add) {
    const canHire = await hasOpenSlots(configuration.committee)
    if (!canHire) {
      throw new RequestError('The committee does not have available slots')
    }
  }

  if (!configuration.name) {
    if (!isEthereumAddress(configuration.address)) {
      throw new RequestError('Invalid address')
    }
    try {
      const profile = await getProfile(configuration.address)
      configuration.name = profile?.name
    } catch (error) {
      ErrorService.report('Error getting profile', {
        error,
        address: configuration.address,
        category: ErrorCategory.Profile,
      })
    }
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
  const alreadyCatalyst = isAlreadyACatalyst(configuration.domain)
  if (configuration.type === CatalystType.Add && alreadyCatalyst) {
    throw new RequestError('Domain is already a catalyst')
  }

  if (configuration.type === CatalystType.Remove && !alreadyCatalyst) {
    throw new RequestError('Domain is not a catalyst')
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
  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_GRANT)
  const grantRequest = validate<GrantRequest>(newProposalGrantValidator, req.body || {})
  const grantInCreation = await ProjectService.getGrantInCreation(grantRequest, user)
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

const newProposalPitchValidator = schema.compile(newProposalPitchScheme)

export async function createProposalPitch(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPitch>(newProposalPitchValidator, req.body || {})

  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_PITCH)

  return createProposal({
    user,
    type: ProposalType.Pitch,
    required_to_pass: ProposalRequiredVP[ProposalType.Pitch],
    finish_at: getProposalEndDate(Number(process.env.GATSBY_DURATION_PITCH)),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const newProposalTenderValidator = schema.compile(newProposalTenderScheme)

export async function createProposalTender(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalTender>(newProposalTenderValidator, req.body || {})

  await validateLinkedProposal(configuration.linked_proposal_id, ProposalType.Pitch)
  await validateSubmissionThreshold(user, SUBMISSION_THRESHOLD_TENDER)

  const tenderProposals = await ProposalModel.getProposalList({
    linkedProposalId: configuration.linked_proposal_id,
    order: 'ASC',
  })

  if (hasTenderProcessFinished(tenderProposals)) {
    throw new RequestError('Pitch proposal already went through the tender process')
  }

  if (hasTenderProcessStarted(tenderProposals)) {
    throw new RequestError('Tender process already started for this pitch proposal')
  }

  const start_at =
    tenderProposals.length > 0
      ? tenderProposals[0].start_at
      : Time().add(Number(process.env.SUBMISSION_WINDOW_DURATION_TENDER), 'seconds').toDate()
  const finish_at = Time(start_at).add(Number(process.env.DURATION_TENDER), 'seconds').toDate()

  return createProposal({
    user,
    type: ProposalType.Tender,
    required_to_pass: ProposalRequiredVP[ProposalType.Tender],
    start_at,
    finish_at,
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES,
    },
  })
}

const BidRequestValidator = schema.compile(BidRequestSchema)
export async function createProposalBid(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<BidRequest>(BidRequestValidator, req.body || {})
  const { linked_proposal_id, ...bid } = configuration
  await validateLinkedProposal(linked_proposal_id, ProposalType.Tender)
  await BidService.createBid(linked_proposal_id, user, bid)
}

export async function createProposal(proposalInCreation: ProposalInCreation) {
  try {
    return await ProposalService.createProposal(proposalInCreation)
  } catch (error: any) {
    const errorTitle = 'Error creating proposal'
    ErrorService.report(errorTitle, {
      error,
      proposal: JSON.stringify(proposalInCreation),
      category: ErrorCategory.Proposal,
    })
    throw new RequestError(
      `${errorTitle}\n 
    Error: ${error.message ? error.message : JSON.stringify(error)}`,
      RequestError.InternalServerError,
      error
    )
  }
}

export async function getProposal(req: Request<{ proposal: string }>) {
  const id = validateProposalId(req.params.proposal)
  try {
    return await ProposalService.getProposal(id)
  } catch (e) {
    throw new RequestError(`Proposal "${id}" not found`, RequestError.NotFound)
  }
}

const updateProposalStatusValidator = schema.compile(updateProposalStatusScheme)

export async function updateProposalStatus(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const id = req.params.proposal
  if (!isDAOCommittee(user)) {
    throw new RequestError('Only DAO committee members can enact a proposal', RequestError.Forbidden)
  }

  const proposal = await getProposal(req)
  const configuration = validate<UpdateProposalStatusProposal>(updateProposalStatusValidator, req.body || {})
  const newStatus = configuration.status
  if (!isValidUpdateProposalStatus(proposal.status, newStatus)) {
    throw new RequestError(
      `${proposal.status} can't be updated to ${newStatus}`,
      RequestError.BadRequest,
      configuration
    )
  }

  const update: Partial<ProposalAttributes> = {
    status: newStatus,
    updated_at: new Date(),
  }

  const isEnactedStatus = update.status === ProposalStatus.Enacted
  const isGrantProposal = proposal.type === ProposalType.Grant
  if (isEnactedStatus) {
    update.enacted = true
    update.enacted_by = user
    if (isGrantProposal) {
      const { vesting_addresses } = configuration
      if (!vesting_addresses || vesting_addresses.length === 0) {
        throw new RequestError('Vesting addresses are required for grant proposals', RequestError.BadRequest)
      }
      if (vesting_addresses.some((address) => !isEthereumAddress(address))) {
        throw new RequestError('Some vesting address is invalid', RequestError.BadRequest)
      }
      if (!validateUniqueAddresses(vesting_addresses)) {
        throw new RequestError('Vesting addresses must be unique', RequestError.BadRequest)
      }
      update.vesting_addresses = vesting_addresses
      update.textsearch = ProposalModel.textsearch(
        proposal.title,
        proposal.description,
        proposal.user,
        update.vesting_addresses
      )
      const vestingContractData = await getVestingContractData(vesting_addresses[vesting_addresses.length - 1], id)
      await UpdateModel.createPendingUpdates(id, vestingContractData, proposal.configuration.vestingStartDate)
    }
  } else if (update.status === ProposalStatus.Passed) {
    update.passed_by = user
  } else if (update.status === ProposalStatus.Rejected) {
    update.rejected_by = user
  }

  await ProposalModel.update<ProposalAttributes>(update, { id })
  if (isEnactedStatus && isGrantProposal) {
    NotificationService.grantProposalEnacted(proposal)
  }

  const updatedProposal: ProposalAttributes | undefined = await ProposalModel.findOne<ProposalAttributes>({
    id,
  })
  updatedProposal && DiscourseService.commentUpdatedProposal(updatedProposal)

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

export async function getProposalComments(req: Request<{ proposal: string }>): Promise<ProposalCommentsInDiscourse> {
  const proposal = await getProposal(req)
  try {
    return await DiscourseService.getPostComments(proposal.discourse_topic_id)
  } catch (error) {
    logger.log('Error fetching discourse topic', {
      error,
      discourseTopicId: proposal.discourse_topic_id,
      proposalId: proposal.id,
      category: ErrorCategory.Discourse,
    })
    return {
      comments: [],
      totalComments: 0,
    }
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

  return linkedProposal
}

async function validateSubmissionThreshold(user: string, submissionThreshold?: string) {
  const requiredVp = Number(submissionThreshold || SUBMISSION_THRESHOLD_POLL)
  const vpDistribution = await SnapshotGraphql.get().getVpDistribution(user)
  if (vpDistribution.total < requiredVp) {
    throw new RequestError(`User does not meet the required "${requiredVp}" VP`, RequestError.Forbidden)
  }
}

// TODO: Remove. Deprecated.
async function getGrants(): Promise<CategorizedGrants> {
  return await ProjectService.getGrants()
}

// TODO: Still in use by user profile page.
async function getGrantsByUser(req: Request): ReturnType<typeof getGrants> {
  const address = validateAddress(req.params.address)
  const isCoauthoring = req.query.coauthor === 'true'

  let coauthoringProposalIds = new Set<string>()

  if (isCoauthoring) {
    const coauthoring = await CoauthorModel.findProposals(address, CoauthorStatus.APPROVED)
    coauthoringProposalIds = new Set(coauthoring.map((coauthoringAttributes) => coauthoringAttributes.proposal_id))
  }

  const grantsResult = await getGrants()

  const filterGrants = (grants: ProjectWithUpdate[]) => {
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
