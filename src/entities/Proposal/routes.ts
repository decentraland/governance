import { Request } from 'express'
import { v1 as uuid } from 'uuid'
import { AlchemyProvider, Block } from '@ethersproject/providers'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import { auth, WithAuth } from "decentraland-gatsby/dist/entities/Auth/middleware";
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle';
import validate from 'decentraland-gatsby/dist/entities/Route/validate';
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { SNAPSHOT_SPACE, SNAPSHOT_ACCOUNT, SNAPSHOT_ADDRESS, SNAPSHOT_DURATION, signMessage } from '../Snapshot/utils';
import { Snapshot, SnapshotResult, SnapshotSpace, SnapshotStatus } from '../../api/Snapshot';
import { Discourse, DiscoursePost } from '../../api/Discourse';
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../Discourse/utils';
import Time from 'decentraland-gatsby/dist/utils/date/Time';
import ProposalModel from './model';
import {
  ProposalAttributes,
  NewProposalPoll,
  newProposalPollScheme,
  ProposalType,
  ProposalStatus,
  NewProposalBanName,
  newProposalPOIScheme,
  NewProposalPOI,
  newProposalCatalystScheme,
  NewProposalCatalyst,
  newProposalGrantScheme,
  NewProposalGrant,
  EnactProposalProposal,
  enactProposalScheme,
  newProposalBanNameScheme,
  ProposalRequiredVP
} from './types';
import RequestError from 'decentraland-gatsby/dist/entities/Route/error';
import {
  DEFAULT_CHOICES,
  isAlreadyACatalyst,
  isAlreadyBannedName,
  isAlreadyPointOfInterest,
  proposalUrl,
  snapshotProposalUrl,
  forumUrl,
  isValidName,
  MAX_PROPOSAL_LIMIT,
  MIN_PROPOSAL_OFFSET,
} from './utils';
import { IPFS, HashContent } from '../../api/IPFS';
import VotesModel from '../Votes/model'
import isCommitee from '../Committee/isCommittee';
import isUUID from 'validator/lib/isUUID';
import * as templates from './templates'
import Catalyst, { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst';

// Feature flags
// const FEATURE_FLAGS_API = env('FEATURE_FLAGS_API', '')

export default routes((route) => {
  const withAuth = auth()
  const withOptionalAuth = auth({ optional: true })
  route.get('/proposals', withOptionalAuth, handleJSON(getProposals))
  route.post(`/proposals/poll`, withAuth, handleAPI(createProposalPoll))
  route.post(`/proposals/ban-name`, withAuth, handleAPI(createProposalBanName))
  route.post(`/proposals/poi`, withAuth, handleAPI(createProposalPOI))
  route.post(`/proposals/catalyst`, withAuth, handleAPI(createProposalCatalyst))
  route.post(`/proposals/grant`, withAuth, handleAPI(createProposalGrant))
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(enactProposal))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
  // route.patch('/proposals/:proposal/status', withAuth, handleAPI(reactivateProposal))
  // route.post('/proposals/votes', withAuth, handleAPI(forwardVote))
})

function formatError(err: Error) {
  return process.env.NODE_ENV !== 'production' ? err : {
    ...err,
    message: err.message,
    stack: err.stack,
  };
}

function inBackground(fun: () => Promise<any>) {
  Promise.resolve()
    .then(fun)
    .then((result) => console.log('Completed background task: ', JSON.stringify(result)))
    .catch((err) => console.log('Error running background task: ', formatError(err)))
}

function dropDiscourseTopic(topic_id: number) {
  inBackground(() => {
    console.log(`Dropping discourse topic:`, topic_id)
    return Discourse.get().removeTopic(topic_id, DISCOURSE_AUTH)
  })
}

function dropSnapshotProposal(proposal_space: string, proposal_id: string) {
  inBackground(async () => {
    console.log(`Dropping snapshot proposal: ${proposal_space}/${proposal_id}`)
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
  const type = req.query.type && String(req.query.type)
  const status = req.query.status && String(req.query.status)
  const user = req.query.user && String(req.query.user)

  let subscribed: string | undefined = undefined
  if (req.query.subscribed) {
    subscribed = req.auth || ''
  }

  let offset = req.query.offset && Number.isFinite(Number(req.query.offset)) ?
    Number(req.query.offset) : MIN_PROPOSAL_OFFSET

  let limit = req.query.limit && Number.isFinite(Number(req.query.limit)) ?
    Number(req.query.limit) : MAX_PROPOSAL_LIMIT

  const [ total, data ] = await Promise.all([
    ProposalModel.getProposalTotal({ type, status, user, subscribed }),
    ProposalModel.getProposalList({ type, status, user, subscribed, offset, limit })
  ])

  return { ok: true, total, data }
}

const newProposalPollValidator = schema.compile(newProposalPollScheme)
export async function createProposalPoll(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPoll>(newProposalPollValidator, req.body || {})
  return createProposal({
    user,
    type: ProposalType.Poll,
    required_to_pass: ProposalRequiredVP[ProposalType.Poll],
    configuration,
  })
}

const newProposalBanNameValidator = schema.compile(newProposalBanNameScheme)
export async function createProposalBanName(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalBanName>(newProposalBanNameValidator, req.body || {})
  const validName = isValidName(configuration.name)
  if (!validName) {
    throw new RequestError(`Name is not valid`)
  }

  const alreadyBanned = await isAlreadyBannedName(configuration.name)
  if (alreadyBanned) {
    throw new RequestError(`Name is already banned`)
  }

  return createProposal({
    user,
    type: ProposalType.BanName,
    required_to_pass: ProposalRequiredVP[ProposalType.BanName],
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES
    },
  })
}

const newProposalPOIValidator = schema.compile(newProposalPOIScheme)
export async function createProposalPOI(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPOI>(newProposalPOIValidator, req.body || {})
  const alreadyPointOfInterest = await isAlreadyPointOfInterest(configuration.x, configuration.y)
  if (alreadyPointOfInterest) {
    throw new RequestError(`Coordiante is already a point of interest`)
  }

  return createProposal({
    user,
    type: ProposalType.POI,
    required_to_pass: ProposalRequiredVP[ProposalType.POI],
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES
    },
  })
}

const newProposalCatalystValidator = schema.compile(newProposalCatalystScheme)
export async function createProposalCatalyst(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalCatalyst>(newProposalCatalystValidator, req.body || {})
  const alreadyCatalyst = await isAlreadyACatalyst(configuration.domain)
  if (alreadyCatalyst) {
    throw new RequestError(`Domain is already a catalyst`)
  }

  return createProposal({
    user,
    type: ProposalType.Catalyst,
    required_to_pass: ProposalRequiredVP[ProposalType.Catalyst],
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES
    },
  })
}

const newProposalGrantValidator = schema.compile(newProposalGrantScheme)
export async function createProposalGrant(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalGrant>(newProposalGrantValidator, req.body || {})

  return createProposal({
    user,
    type: ProposalType.Grant,
    required_to_pass: ProposalRequiredVP[ProposalType.Grant],
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES
    },
  })
}

export async function createProposal(data: Pick<ProposalAttributes, 'type' | 'user' | 'configuration' | 'required_to_pass'>) {
  const id = uuid()
  const address = SNAPSHOT_ADDRESS
  const start = Time.utc().set('seconds', 0)
  const end = Time.utc(start).add(SNAPSHOT_DURATION, 'seconds')
  const proposal_url = proposalUrl({ id })
  const title = await templates.title({ type: data.type, configuration: data.configuration })
  const description = await templates.description({ type: data.type, configuration: data.configuration })

  let profile: Avatar | null
  try {
    profile = await Catalyst.get().getProfile(data.user)
  } catch (err) {
    throw new RequestError(`Error getting profile "${data.user}"`, RequestError.InternalServerError, err)
  }

  //
  // Create proposal payload
  //
  let msg: string
  let block: Block
  let snapshotStatus: SnapshotStatus
  let snapshotSpace: SnapshotSpace
  try {
    snapshotStatus = await Snapshot.get().getStatus()
    snapshotSpace = await Snapshot.get().getSpace(SNAPSHOT_SPACE)
  } catch (err) {
    throw new RequestError(`Error getting snapshot space "${SNAPSHOT_SPACE}"`, RequestError.InternalServerError, err)
  }

  try {
    const provider = new AlchemyProvider(Number(snapshotSpace.network), process.env.ALCHEMY_API_KEY)
    block = await provider.getBlock('latest')
  } catch (err) {
    throw new RequestError(`Couldn't get the latest block`, RequestError.InternalServerError, err)
  }

  try {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: data.user,
      type: data.type,
      configuration: data.configuration,
      profile,
      proposal_url
    }

    msg = await Snapshot.get().createProposalMessage(SNAPSHOT_SPACE,
      snapshotStatus.version, snapshotSpace.network, snapshotSpace.strategies, {
      name: await templates.snapshotTitle(snapshotTemplateProps),
      body: await templates.snapshotDescription(snapshotTemplateProps),
      choices: data.configuration.choices,
      snapshot: block.number,
      end,
      start,
    })
  } catch (err) {
    throw new RequestError(`Error creating the snapshot message`, RequestError.InternalServerError, err)
  }

  //
  // Create proposal in Snapshot
  //
  let snapshotProposal: SnapshotResult
  try {
    const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
    console.log(sig, msg)
    snapshotProposal = await Snapshot.get().send(address, msg, sig)
  } catch (err) {
    throw new RequestError(`Couldn't create proposal in snapshot`, RequestError.InternalServerError, err)
  }

  const snapshot_url = snapshotProposalUrl({ snapshot_space: SNAPSHOT_SPACE, snapshot_id: snapshotProposal.ipfsHash })
  console.log(`Snapshot proposal created:`, snapshot_url, JSON.stringify(snapshotProposal))

  //
  // Get snapshot content
  //
  let snapshotContent: HashContent
  try {
    snapshotContent = await IPFS.get().getHash(snapshotProposal.ipfsHash)
  } catch (err) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw new RequestError(`Couldn't retrieve proposal from the IPFS`, RequestError.InternalServerError, err)
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
      snapshot_id: snapshotProposal.ipfsHash
    }

    discourseProposal = await Discourse.get().createPost({
      category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
      title: await templates.forumTitle(discourseTemplateProps),
      raw: await templates.forumDescription(discourseTemplateProps),
    }, DISCOURSE_AUTH)
  } catch (err) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw new RequestError(`Forum error: ${err.body.errors.join(', ')}`, RequestError.InternalServerError, err)
  }

  const forum_url = forumUrl({ discourse_topic_slug: discourseProposal.topic_slug, discourse_topic_id: discourseProposal.topic_id })
  console.log(`Discourse proposal created:`, forum_url, JSON.stringify(discourseProposal))

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
    created_at: start.toJSON() as any,
    updated_at: start.toJSON() as any,
  }

  try {
    await ProposalModel.create(newProposal)
    await VotesModel.createEmpty(id)
  } catch (err) {
    dropDiscourseTopic(discourseProposal.topic_id)
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw err
  }

  return ProposalModel.parse(newProposal)
}

export async function getProposal(req: Request<{ proposal: string }>) {
  const id = req.params.proposal
  if (!isUUID(id || ''))  {
    throw new RequestError(`Not found proposal: "${id}"`, RequestError.NotFound)
  }

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id, deleted: false })
  if (!proposal) {
    throw new RequestError(`Not found proposal: "${id}"`, RequestError.NotFound)
  }

  return ProposalModel.parse(proposal)
}

const enactProposalValidator = schema.compile(enactProposalScheme)
export async function enactProposal(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const id = req.params.proposal
  if (!isCommitee(user)) {
    throw new RequestError(`Only committed menbers can enact a proposal`, RequestError.Forbidden)
  }

  const proposal = await getProposal(req)
  const configuration = validate<EnactProposalProposal>(enactProposalValidator, req.body || {})
  if (
    proposal.status !== ProposalStatus.Finished &&
    proposal.status !== ProposalStatus.Passed
  ) {
    throw new RequestError(`Only "${ProposalStatus.Finished}" or "${ProposalStatus.Passed}" proposal can be enacted`)
  }

  const update: Partial<ProposalAttributes> = {
    status: ProposalStatus.Enacted,
    enacted: true,
    enacted_by: user,
    enacted_description: configuration.enacted_description || null,
    updated_at: new Date(),
  }

  await ProposalModel.update<ProposalAttributes>(update, { id })

  return {
    ...proposal,
    ...update
  }
}

export async function removeProposal(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const updated_at = new Date()
  const id = req.params.proposal
  const proposal = await getProposal(req)

  const allowToRemove = proposal.user === user
  if (!allowToRemove) {
    throw new RequestError(`Forbidden`, RequestError.Forbidden)
  }

  await ProposalModel.update<ProposalAttributes>(
    {
      deleted: true,
      deleted_by: user,
      updated_at,
      status: ProposalStatus.Deleted
    }, {
      id
    }
  )
  dropDiscourseTopic(proposal.discourse_topic_id)
  dropSnapshotProposal(proposal.snapshot_space, proposal.snapshot_id)
  return true
}

// export async function reactivateProposal(req: WithAuth<Request<{ proposal: string }>>) {
//   const user = req.auth!
//   if (!isAdmin(user)) {
//     throw new RequestError(`Only admin menbers can reactivate a proposal`, RequestError.Forbidden)
//   }

//   const proposal = await getProposal(req)
//   await ProposalModel.update<ProposalAttributes>({ status: ProposalStatus.Active }, { id: proposal.id })

//   return {
//     ...proposal,
//     status: ProposalStatus.Active
//   }
// }