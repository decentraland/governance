import { AlchemyProvider, Block } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import Catalyst, { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { Request } from 'express'
import { filter } from 'lodash'
import { v1 as uuid } from 'uuid'
import isUUID from 'validator/lib/isUUID'

import { DclData, TransparencyGrantsTiers } from '../../api/DclData'
import { Discourse, DiscourseComment, DiscoursePost } from '../../api/Discourse'
import { HashContent, IPFS } from '../../api/IPFS'
import { Snapshot, SnapshotResult, SnapshotSpace, SnapshotStatus } from '../../api/Snapshot'
import CoauthorModel from '../Coauthor/model'
import isCommitee from '../Committee/isCommittee'
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY, filterComments } from '../Discourse/utils'
import { SNAPSHOT_ADDRESS, SNAPSHOT_DURATION, SNAPSHOT_SPACE } from '../Snapshot/constants'
import { signMessage } from '../Snapshot/utils'
import UpdateModel from '../Updates/model'
import { IndexedUpdate, UpdateAttributes, UpdateStatus } from '../Updates/types'
import { getPublicUpdates } from '../Updates/utils'
import VotesModel from '../Votes/model'
import { getVotes } from '../Votes/routes'

import { getUpdateMessage } from './templates/messages'

import ProposalModel from './model'
import * as templates from './templates'
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
  forumUrl,
  isAlreadyACatalyst,
  isAlreadyBannedName,
  isAlreadyPointOfInterest,
  isGrantSizeValid,
  isValidName,
  isValidPointOfInterest,
  isValidUpdateProposalStatus,
  proposalUrl,
  snapshotProposalUrl,
} from './utils'

const POLL_SUBMISSION_THRESHOLD = requiredEnv('GATSBY_SUBMISSION_THRESHOLD_POLL')
const SNAPSHOT_PRIVATE_KEY = requiredEnv('SNAPSHOT_PRIVATE_KEY')
const SNAPSHOT_ACCOUNT = new Wallet(SNAPSHOT_PRIVATE_KEY)

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
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(updateProposalStatus))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
  route.get('/proposals/:proposal/comments', handleAPI(proposalComments))
})

function formatError(err: Error) {
  const errorObj = {
    ...err,
    message: err.message,
    stack: err.stack,
  }

  return process.env.NODE_ENV !== 'production' ? err : errorObj
}

function inBackground(fun: () => Promise<any>) {
  Promise.resolve()
    .then(fun)
    .then((result) => logger.log('Completed background task', { result: JSON.stringify(result) }))
    .catch((err) => logger.error('Error running background task', formatError(err)))
}

function dropDiscourseTopic(topic_id: number) {
  inBackground(() => {
    logger.log('Dropping discourse topic', { topic_id: topic_id })
    return Discourse.get().removeTopic(topic_id, DISCOURSE_AUTH)
  })
}

function dropSnapshotProposal(proposal_space: string, proposal_id: string) {
  inBackground(async () => {
    logger.log(`Dropping snapshot proposal: ${proposal_space}/${proposal_id}`)
    const address = SNAPSHOT_ADDRESS
    const msg = await Snapshot.get().removeProposalMessage(proposal_space, proposal_id)
    const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
    const result = await Snapshot.get().send(address, msg, sig)
    return {
      msg: JSON.parse(msg),
      sig,
      address,
      result,
    }
  })
}

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

export async function createProposal(
  data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass' | 'finish_at'>
) {
  const id = uuid()
  const start = Time.utc().set('seconds', 0)
  const end = data.finish_at
  const proposal_url = proposalUrl({ id })
  const coAuthors =
    data.configuration && data.configuration.coAuthors ? (data.configuration.coAuthors as string[]) : null

  if (coAuthors) {
    delete data.configuration.coAuthors
  }

  const title = templates.title({ type: data.type, configuration: data.configuration })
  const description = await templates.description({ type: data.type, configuration: data.configuration })

  let profile: Avatar | null
  try {
    profile = await Catalyst.get().getProfile(data.user)
  } catch (err) {
    throw new RequestError(`Error getting profile "${data.user}"`, RequestError.InternalServerError, err as Error)
  }

  //
  // Create proposal payload
  //
  let snapshotStatus: SnapshotStatus
  let snapshotSpace: SnapshotSpace
  try {
    const values = await Promise.all([await Snapshot.get().getStatus(), await Snapshot.get().getSpace(SNAPSHOT_SPACE)])
    snapshotStatus = values[0]
    snapshotSpace = values[1]
  } catch (err) {
    throw new RequestError(
      `Error getting snapshot space "${SNAPSHOT_SPACE}"`,
      RequestError.InternalServerError,
      err as Error
    )
  }

  let block: Block
  try {
    const provider = new AlchemyProvider(Number(snapshotSpace.network), process.env.ALCHEMY_API_KEY)
    block = await provider.getBlock('latest')
  } catch (err) {
    throw new RequestError("Couldn't get the latest block", RequestError.InternalServerError, err as Error)
  }

  let msg: string
  try {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: data.user,
      type: data.type,
      configuration: data.configuration,
      profile,
      proposal_url,
    }

    msg = await Snapshot.get().createProposalMessage(
      SNAPSHOT_SPACE,
      snapshotStatus.version,
      snapshotSpace.network,
      snapshotSpace.strategies,
      {
        name: templates.snapshotTitle(snapshotTemplateProps),
        body: await templates.snapshotDescription(snapshotTemplateProps),
        choices: data.configuration.choices,
        snapshot: block.number,
        end,
        start,
      }
    )
  } catch (err) {
    throw new RequestError('Error creating the snapshot message', RequestError.InternalServerError, err as Error)
  }

  //
  // Create proposal in Snapshot
  //
  let snapshotProposal: SnapshotResult
  try {
    const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
    logger.log('Creating proposal in snapshot', { signed: sig, message: msg })
    snapshotProposal = await Snapshot.get().send(SNAPSHOT_ADDRESS, msg, sig)
  } catch (err) {
    throw new RequestError("Couldn't create proposal in snapshot", RequestError.InternalServerError, err as Error)
  }

  const snapshot_url = snapshotProposalUrl({ snapshot_space: SNAPSHOT_SPACE, snapshot_id: snapshotProposal.ipfsHash })
  logger.log('Snapshot proposal created', {
    snapshot_url: snapshot_url,
    snapshot_proposal: JSON.stringify(snapshotProposal),
  })

  //
  // Get snapshot content
  //
  let snapshotContent: HashContent
  try {
    snapshotContent = await IPFS.get().getHash(snapshotProposal.ipfsHash)
  } catch (err) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw new RequestError("Couldn't retrieve proposal from the IPFS", RequestError.InternalServerError, err as Error)
  }

  //
  // Create proposal in Discourse
  //
  let discourseProposal: DiscoursePost
  try {
    const discourseTemplateProps: templates.ForumTemplateProps = {
      type: data.type,
      configuration: data.configuration,
      user: data.user,
      profile,
      proposal_url,
      snapshot_url,
      snapshot_id: snapshotProposal.ipfsHash,
    }

    discourseProposal = await Discourse.get().createPost(
      {
        category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
        title: templates.forumTitle(discourseTemplateProps),
        raw: await templates.forumDescription(discourseTemplateProps),
      },
      DISCOURSE_AUTH
    )
  } catch (error: any) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw new RequestError(`Forum error: ${error.body.errors.join(', ')}`, RequestError.InternalServerError, error)
  }

  logger.log('Discourse proposal created', {
    forum_url: forumUrl({
      discourse_topic_slug: discourseProposal.topic_slug,
      discourse_topic_id: discourseProposal.topic_id,
    }),
    discourse_proposal: JSON.stringify(discourseProposal),
  })

  //
  // Create proposal in DB
  //

  const newProposal: ProposalAttributes = {
    ...data,
    id,
    title,
    description,
    configuration: JSON.stringify(data.configuration),
    status: ProposalStatus.Active,
    snapshot_id: snapshotProposal.ipfsHash,
    snapshot_space: SNAPSHOT_SPACE,
    snapshot_proposal: JSON.stringify(JSON.parse(snapshotContent.msg).payload),
    snapshot_signature: snapshotContent.sig,
    snapshot_network: snapshotSpace.network,
    discourse_id: discourseProposal.id,
    discourse_topic_id: discourseProposal.topic_id,
    discourse_topic_slug: discourseProposal.topic_slug,
    start_at: start.toJSON() as any,
    finish_at: end.toJSON() as any,
    deleted: false,
    deleted_by: null,
    enacted: false,
    enacted_by: null,
    enacted_description: null,
    enacting_tx: null,
    vesting_address: null,
    passed_by: null,
    passed_description: null,
    rejected_by: null,
    rejected_description: null,
    created_at: start.toJSON() as any,
    updated_at: start.toJSON() as any,
    textsearch: ProposalModel.textsearch(title, description, data.user, null),
  }

  try {
    await ProposalModel.create(newProposal)
    await VotesModel.createEmpty(id)
    if (coAuthors) {
      CoauthorModel.createMultiple(id, coAuthors)
    }
  } catch (err) {
    dropDiscourseTopic(discourseProposal.topic_id)
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw err
  }

  return ProposalModel.parse(newProposal)
}

export async function getProposal(req: Request<{ proposal: string }>) {
  const id = req.params.proposal
  if (!isUUID(id || '')) {
    throw new RequestError(`Not found proposal: "${id}"`, RequestError.NotFound)
  }

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id, deleted: false })
  if (!proposal) {
    throw new RequestError(`Not found proposal: "${id}"`, RequestError.NotFound)
  }

  return ProposalModel.parse(proposal)
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
    await Discourse.get().commentOnPost(discourseComment, DISCOURSE_AUTH)
  })
}

export async function updateProposalStatus(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const id = req.params.proposal
  if (!isCommitee(user)) {
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

  const allowToRemove = proposal.user === user || isCommitee(user)
  if (!allowToRemove) {
    throw new RequestError('Forbidden', RequestError.Forbidden)
  }

  await ProposalModel.update<ProposalAttributes>(
    {
      deleted: true,
      deleted_by: user,
      updated_at,
      status: ProposalStatus.Deleted,
    },
    {
      id,
    }
  )
  dropDiscourseTopic(proposal.discourse_topic_id)
  dropSnapshotProposal(proposal.snapshot_space, proposal.snapshot_id)
  return true
}

export async function proposalComments(req: Request<{ proposal: string }>) {
  const proposal = await getProposal(req)
  try {
    const comments = await Discourse.get().getTopic(proposal.discourse_topic_id)
    return filterComments(comments)
  } catch (e) {
    logger.error('Could not get proposal comments', e as Error)
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
  const userVp = await Snapshot.get().getVotingPower(user, SNAPSHOT_SPACE)
  if (userVp.totalVp < requiredVp) {
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
          Object.assign(newGrant, {
            contract: {
              vesting_total_amount: Math.round(grant.vesting_total_amount),
              vestedAmount: Math.round(grant.vesting_released + grant.vesting_releasable),
              releasable: Math.round(grant.vesting_releasable),
              released: Math.round(grant.vesting_released),
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
            update_timestamp:
              update?.updated_at && (update?.status === UpdateStatus.Done || update?.status === UpdateStatus.Late)
                ? Time(update?.updated_at).unix()
                : 0,
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
