import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Snapshot, SnapshotVote } from '../../api/Snapshot'
import ProposalModel from '../Proposal/model'
import { getProposal } from '../Proposal/routes'
import { ProposalAttributes } from '../Proposal/types'
import { SNAPSHOT_SPACE } from '../Snapshot/constants'

import VotesModel from './model'
import { Vote, VoteAttributes } from './types'
import { createVotes, getProposalScores, toProposalIds } from './utils'

export default routes((route) => {
  route.get('/proposals/:proposal/votes', handleAPI(getProposalVotes))
  route.get('/votes', handleAPI(getCachedVotes))
  route.get('/votes/:address', handleAPI(getAddressVotes))
})

export async function getProposalVotes(req: Request<{ proposal: string }>) {
  const proposal = await getProposal(req)
  let latestVotes = await VotesModel.getVotes(proposal.id)
  if (!latestVotes) {
    latestVotes = await VotesModel.createEmpty(proposal.id)
  }

  if (!!latestVotes.hash && Time.date(proposal.finish_at).getTime() + Time.Hour < Date.now()) {
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
  const now = new Date()
  const hash = VotesModel.hashVotes(snapshotVotes)
  const balance = await getProposalScores(
    proposal,
    snapshotVotes.map((vote) => vote.voter)
  )
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

export async function getProposalVote(req: Request<{ proposal: string; address: string }>) {
  const proposal = await getProposal(req)
  const address = String(req.params.address).toLowerCase()

  if (!isEthereumAddress(address)) {
    return null
  }

  const latestVotes = await VotesModel.getVotes(proposal.id)
  return latestVotes?.votes[address.toLowerCase()] || null
}

export async function getCachedVotes(req: Request) {
  const list = toProposalIds(req.query.id as string[])
  const scores = await VotesModel.findAny(list)
  return scores.reduce((result, vote) => {
    result[vote.proposal_id] = vote.votes
    return result
  }, {} as Record<string, Record<string, Vote>>)
}

export async function getVotes(proposal_id: string) {
  const proposalVotes: VoteAttributes | null = await VotesModel.getVotes(proposal_id)
  return proposalVotes?.votes ? proposalVotes.votes : await VotesModel.createEmpty(proposal_id)
}

async function getAddressVotes(req: Request) {
  const address = req.params.address
  const votes = await Snapshot.get().getAddressVotes(SNAPSHOT_SPACE, address)

  if (votes.length === 0) {
    return []
  }

  const proposalIds = votes.map((vote) => vote.proposal.id)
  const proposals = await ProposalModel.findFromSnapshotIds(proposalIds)

  const votesWithProposalData = []

  for (const vote of votes) {
    const currentProposal = proposals.find((item) => item.snapshot_id === vote.proposal.id)

    votesWithProposalData.push({
      ...vote,
      proposal: {
        ...vote.proposal,
        proposal_id: currentProposal?.id,
        status: currentProposal?.status,
        type: currentProposal?.type,
      },
    })
  }

  return votesWithProposalData
}
