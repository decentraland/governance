import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import VotesModel from '../../entities/Votes/model'
import { Vote, VoteAttributes } from '../../entities/Votes/types'
import { createVotes, toProposalIds } from '../../entities/Votes/utils'
import { SnapshotService } from '../../services/SnapshotService'
import Time from '../../utils/date/Time'
import { validateAddress } from '../utils/validations'

import { getProposal } from './proposal'

export default routes((route) => {
  route.get('/proposals/:proposal/votes', handleAPI(getProposalVotes))
  route.get('/votes', handleAPI(getCachedVotes))
  route.get('/votes/:address', handleAPI(getAddressVotesWithProposals))
})

export async function getProposalVotes(req: Request<{ proposal: string }>) {
  const refresh = req.query.refresh === 'true'

  const proposal = await getProposal(req)
  let latestVotes = await VotesModel.getVotes(proposal.id)
  if (!latestVotes) {
    latestVotes = await VotesModel.createEmpty(proposal.id)
  }

  if (!!latestVotes.hash && Time.date(proposal.finish_at).getTime() + Time.Hour < Date.now() && !refresh) {
    return latestVotes.votes
  }

  let snapshotVotes: SnapshotVote[]
  try {
    snapshotVotes = await SnapshotGraphql.get().getProposalVotes(proposal.snapshot_id)
  } catch (err) {
    return latestVotes?.votes || {}
  }

  const hash = VotesModel.hashVotes(snapshotVotes)
  if (latestVotes.hash === hash && !refresh) {
    return latestVotes.votes
  }

  return updateSnapshotProposalVotes(proposal, snapshotVotes)
}

export async function updateSnapshotProposalVotes(proposal: ProposalAttributes, snapshotVotes: SnapshotVote[]) {
  const now = new Date()
  const hash = VotesModel.hashVotes(snapshotVotes)
  const votes = createVotes(snapshotVotes)
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

async function getAddressVotesWithProposals(req: Request) {
  const address = req.params.address
  validateAddress(address)
  const first = Number(req.query.first) || undefined
  const skip = Number(req.query.skip) || undefined

  const votes = await SnapshotService.getAddressesVotes([address], first, skip)

  if (votes.length === 0) {
    return []
  }

  const proposalIds = votes.map((vote) => vote.proposal!.id)
  const proposals = await ProposalModel.findFromSnapshotIds(proposalIds)

  const votesWithProposalData = []

  for (const vote of votes) {
    const currentProposal = proposals.find((item) => item.snapshot_id === vote.proposal!.id)
    if (!currentProposal) {
      continue
    }

    votesWithProposalData.push({
      ...vote,
      proposal: {
        ...vote.proposal,
        proposal_id: currentProposal?.id,
        status: currentProposal?.status,
        type: currentProposal?.type,
        author: currentProposal?.user,
        finish_at: currentProposal?.finish_at?.getTime(),
      },
    })
  }

  return votesWithProposalData.sort((a, b) => b.created - a.created)
}
