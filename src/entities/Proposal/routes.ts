import { Request } from 'express'
import { v1 as uuid } from 'uuid'
import { AlchemyProvider } from '@ethersproject/providers'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import { auth, WithAuth } from "decentraland-gatsby/dist/entities/Auth/middleware";
import isAdmin from "decentraland-gatsby/dist/entities/Auth/isAdmin";
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import validate from 'decentraland-gatsby/dist/entities/Route/validate';
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { SNAPSHOT_SPACE, SNAPSHOT_ACCOUNT, SNAPSHOT_ADDRESS, SNAPSHOT_DURATION } from '../Snapshot/utils';
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
  newProposalBanNameScheme
} from './types';
import RequestError from 'decentraland-gatsby/dist/entities/Route/error';
import { DEFAULT_CHOICES, isAlreadyACatalyst, isAlreadyBannedName, isAlreadyPointOfInterest, proposalUrl, snapshotUrl, forumUrl, isValidName } from './utils';
import { IPFS, HashContent } from '../../api/IPFS';
import VotesModel from '../Votes/model'
import isCommitee from '../Committee/isCommittee';
import isUUID from 'validator/lib/isUUID';
import * as templates from './templates'

export default routes((route) => {
  const withAuth = auth()
  route.get('/proposals', handleAPI(getProposals))
  route.post(`/proposals/poll`, withAuth, handleAPI(createProposalPoll))
  route.post(`/proposals/ban-name`, withAuth, handleAPI(createProposalBanName))
  route.post(`/proposals/poi`, withAuth, handleAPI(createProposalPOI))
  route.post(`/proposals/catalyst`, withAuth, handleAPI(createProposalCatalyst))
  route.post(`/proposals/grant`, withAuth, handleAPI(createProposalGrant))
  route.get('/proposals/:proposal', handleAPI(getProposal))
  route.patch('/proposals/:proposal', withAuth, handleAPI(enactProposal))
  route.delete('/proposals/:proposal', withAuth, handleAPI(removeProposal))
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
    const sig = SNAPSHOT_ACCOUNT.sign(msg).signature
    const result = await Snapshot.get().send(address, msg, sig)
    return {
      msg: JSON.parse(msg),
      sig,
      address,
      result,
    }
  })
}

export async function getProposals(req: Request) {
  const type = req.query.type && String(req.query.type)
  const status = req.query.status && String(req.query.status)
  const user = req.query.user && String(req.query.user)
  return ProposalModel.getProposalList({ type, status, user })
}

const newProposalPollValidator = schema.compile(newProposalPollScheme)
export async function createProposalPoll(req: WithAuth) {
  const user = req.auth!
  const configuration = validate<NewProposalPoll>(newProposalPollValidator, req.body || {})
  return createProposal({
    user,
    type: ProposalType.Poll,
    title: templates.poll.title(configuration),
    description: templates.poll.description(configuration),
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
    title: templates.banName.title(configuration),
    description: templates.banName.description(configuration),
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
    title: templates.poi.title(configuration),
    description: templates.poi.description(configuration),
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
    title: templates.catalyst.title(configuration),
    description: templates.catalyst.description(configuration),
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
    title: templates.grant.title(configuration),
    description: templates.grant.description(configuration),
    configuration: {
      ...configuration,
      choices: DEFAULT_CHOICES
    },
  })
}

export async function createProposal(data: Pick<ProposalAttributes, 'type' | 'user' | 'title'  | 'description' | 'configuration'>) {
  const id = uuid()
  const address = SNAPSHOT_ADDRESS
  const start = Time.utc().set('seconds', 0)
  const end = Time.utc(start).add(SNAPSHOT_DURATION, 'seconds')

  //
  // Create proposal payload
  //
  let msg: string
  let snapshotStatus: SnapshotStatus
  let snapshotSpace: SnapshotSpace
  try {
    snapshotStatus = await Snapshot.get().getStatus()
    snapshotSpace = await Snapshot.get().getSpace(SNAPSHOT_SPACE)
  } catch (err) {
    throw Object.assign(new Error(`Snapshot service is unreachable (1)`), err)
  }

  try {
    const provider = new AlchemyProvider(Number(snapshotSpace.network), process.env.ALCHEMY_API_KEY)
    const block = await provider.getBlock('latest')
    msg = await Snapshot.get().createProposalMessage(SNAPSHOT_SPACE, snapshotStatus.version, snapshotSpace.network, snapshotSpace.strategies, {
      name: data.title,
      body: [
        data.description,
       `**[Vote on this proposal on the Decentraland DAO](${proposalUrl({ id })})**`,
      ].join('\n\n') + '\n\n',
      choices: data.configuration.choices,
      snapshot: block.number,
      end,
      start,
    })
    console.log(msg)
  } catch (err) {
    throw Object.assign(new Error(`Snapshot service is unreachable (2)`), err)
  }

  //
  // Create proposal in Snapshot
  //
  let snapshotProposal: SnapshotResult
  try {
    const sig = SNAPSHOT_ACCOUNT.sign(msg).signature
    snapshotProposal = await Snapshot.get().send(address, msg, sig)
  } catch (err) {
    throw Object.assign(new Error(`Snapshot service is unreachable (3)`), err)
  }

  const snapshot_url = snapshotUrl({ snapshot_space: SNAPSHOT_SPACE, snapshot_id: snapshotProposal.ipfsHash })
  console.log(`Snapshot proposal created:`, snapshot_url, JSON.stringify(snapshotProposal))

  //
  // Get snapshot content
  //
  let snapshotContent: HashContent
  try {
    snapshotContent = await IPFS.get().getHash(snapshotProposal.ipfsHash)
  } catch (err) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw Object.assign(new Error(`IPFS service is unreachable`), err)
  }

  //
  // Create proposal in Discourse
  //
  let discourseProposal: DiscoursePost
  try {
    const proposalHash = snapshotProposal.ipfsHash.slice(0, 7)
    discourseProposal = await Discourse.get().createPost({
      category: DISCOURSE_CATEGORY ? Number(DISCOURSE_CATEGORY) : undefined,
      title: `[DAO: ${proposalHash}] ${data.title}`,
      raw: [
        data.description,
       `**[Vote on this proposal on the Decentraland DAO](${proposalUrl({ id })})**`,
       `**[View this proposal on Snapshot](${snapshot_url})**`,
      ].join('\n\n') + '\n',
    }, DISCOURSE_AUTH)
  } catch (err) {
    dropSnapshotProposal(SNAPSHOT_SPACE, snapshotProposal.ipfsHash)
    throw Object.assign(new Error(`Forum error: ${err.body.errors.join(', ')}`), err)
  }

  const forum_url = forumUrl({ discourse_topic_slug: discourseProposal.topic_slug, discourse_topic_id: discourseProposal.topic_id })
  console.log(`Discourse proposal created:`, forum_url, JSON.stringify(discourseProposal))

  //
  // Create proposal in DB
  //
  const newProposal: ProposalAttributes = {
    ...data,
    id,
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

  await ProposalModel.update<ProposalAttributes>({ deleted: true, deleted_by: user, updated_at }, { id })
  dropDiscourseTopic(proposal.discourse_topic_id)
  dropSnapshotProposal(proposal.snapshot_space, proposal.snapshot_id)
  return true
}
