import { Request } from 'express'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { getProposal } from '../Proposal/routes'
import { Snapshot, SnapshotVote } from '../../api/Snapshot'
import VotesModel from './model';
import { Vote, VoteAttributes } from './types';
import isEthereumAddress from 'validator/lib/isEthereumAddress';
import { ProposalAttributes } from '../Proposal/types';
import { createVotes, toProposalIds } from './utils';
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware';
import Time from 'decentraland-gatsby/dist/utils/date/Time';
import chunk from 'decentraland-gatsby/dist/utils/array/chunk';

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

  if (!!latestVotes.hash && (Time.date(proposal.finish_at).getTime() + Time.Hour) < Date.now()) {
    return latestVotes.votes
  }

  let snapshotVotes: SnapshotVote[]
  try {
    snapshotVotes = await getSnapshotProposalVotes(proposal)
  } catch (err) {
    return latestVotes?.votes || {}
  }

  const hash = VotesModel.hashVotes(snapshotVotes)
  if (latestVotes.hash === hash) {
    return latestVotes.votes
  }

  return updateSnapshotProposalVotes(proposal, snapshotVotes)
}

export async function getSnapshotProposalVotes(proposal: ProposalAttributes) {
  return Snapshot.get().getProposalVotes(proposal.snapshot_space, proposal.snapshot_id)
}

export async function updateSnapshotProposalVotes(proposal: ProposalAttributes, snapshotVotes: SnapshotVote[]) {
  const now = new Date
  const hash = VotesModel.hashVotes(snapshotVotes)
  const balance = await getScores(proposal, snapshotVotes.map(vote => vote.voter))
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

  const scores = await getScores(proposal, [ user ])
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

export async function getScores(proposal: ProposalAttributes, addresses: string[]) {
  const result = {} as Record<string, number>
  for (const addressesChuck of chunk(addresses, 500)) {
    const blockchainScores: Record<string, number> = await Snapshot.get().getScores(
      proposal.snapshot_space,
      proposal.snapshot_proposal.metadata.strategies,
      proposal.snapshot_network,
      addressesChuck,
      proposal.snapshot_proposal.snapshot
    )

    for (const address of Object.keys(blockchainScores)) {
      result[address.toLowerCase()] = (
        (result[address.toLowerCase()] || 0) +
        Math.floor(blockchainScores[address] || 0)
      )
    }
  }

  return result
}

export async function getVotes(proposal_id: string) {
  let proposalVotes: VoteAttributes | null = await VotesModel.getVotes(proposal_id)
  return proposalVotes?.votes ? proposalVotes.votes : await VotesModel.createEmpty(proposal_id)
}
