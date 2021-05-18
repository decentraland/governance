import { Request } from 'express'
import { AlchemyProvider } from '@ethersproject/providers'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { getProposal } from '../Proposal/routes'
import { Snapshot, SnapshotVote } from '../../api/Snapshot'
import VotesModel from './model';
import { Vote, VoteAttributes } from './types';
import isEthereumAddress from 'validator/lib/isEthereumAddress';
import { ProposalAttributes } from '../Proposal/types';
import { createVotes, toProposalIds } from './utils';
import { utils } from '@snapshot-labs/snapshot.js/dist/snapshot.cjs'
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware';
import Time from 'decentraland-gatsby/dist/utils/date/Time';

export default routes((route) => {
  const withAuth = auth()
  route.get('/proposals/:proposal/votes', handleAPI(getProposalVotes))
  route.get('/proposals/:proposal/vp', withAuth, handleAPI(getMyProposalVotingPower))
  route.get('/votes', handleAPI(getCachedVotes))
})

export async function getProposalVotes(req: Request<{ proposal: string }>) {
  const proposal = await getProposal(req)
  let latestVotes = await VotesModel.getVotes(proposal.id)
  if (!latestVotes) {
    latestVotes = await VotesModel.createEmpty(proposal.id)
  }

  if (Time.date(proposal.finish_at).getTime() < (Date.now() + Time.Day)) {
    return latestVotes.votes
  }

  let snapshotVotes: Record<string, SnapshotVote>
  try {
    snapshotVotes = await Snapshot.get().getProposalVotes(proposal.snapshot_space, proposal.snapshot_id)
  } catch (err) {
    return latestVotes?.votes || {}
  }

  const hash = VotesModel.hashVotes(snapshotVotes)
  if (latestVotes.hash === hash) {
    return latestVotes.votes
  }

  const now = new Date
  const provider = new AlchemyProvider(Number(proposal.snapshot_network), process.env.ALCHEMY_API_KEY)
  const balance = await getScores(proposal, provider, Object.keys(snapshotVotes))
  const votes = createVotes(snapshotVotes, balance)
  await VotesModel.update<VoteAttributes>(
    {
      hash,
      votes: JSON.stringify(votes),
      updated_at: now,
    },
    { proposal_id: proposal.id }
  )

  return votes
}

export async function getProposalVote(req: Request<{ proposal: string, address: string }>) {
  const proposal = await getProposal(req)
  const address = String(req.params.address).toLowerCase()

  if (!isEthereumAddress(address)) {
    return null
  }

  let latestVotes = await VotesModel.getVotes(proposal.id)
  return latestVotes?.votes[address.toLowerCase()] || null
}

const powerCache = new Map<string, number>()
export async function getMyProposalVotingPower(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const proposal = await getProposal(req)
  const key = [ proposal.id, user ].join('/')
  if (powerCache.has(key)) {
    return powerCache.get(key)
  }

  const provider = new AlchemyProvider(Number(proposal.snapshot_network), process.env.ALCHEMY_API_KEY)
  const scores = await getScores(proposal, provider, [ user ])
  const score = scores && scores[user] || 0
  powerCache.set(key, score)
  return score
}

export async function getCachedVotes(req: Request) {
  const list = toProposalIds(req.query.id as string[])
  const scores = await VotesModel.findAny(list)
  return scores.reduce((result, vote) => {
    result[vote.proposal_id] = vote.votes
    return result
  }, {} as Record<string, Record<string, Vote>>)
}

export async function getScores(proposal: ProposalAttributes, provider: any, addresses: string[]) {
  const ethScores: Record<string, number>[] = await utils.getScores(
    proposal.snapshot_space,
    proposal.snapshot_proposal.metadata.strategies,
    proposal.snapshot_network,
    provider,
    addresses,
    proposal.snapshot_proposal.snapshot
  )

  return ethScores.reduce((merged, current) => {
    for (const address of Object.keys(current)) {
      merged[address.toLowerCase()] = Math.floor(current[address] | 0) + (merged[address.toLowerCase()] || 0)
    }
    return merged
  }, {} as Record<string, number>)
}