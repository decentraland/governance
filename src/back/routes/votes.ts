import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import isNumber from 'lodash/isNumber'

import { SnapshotGraphql } from '../../clients/SnapshotGraphql'
import { SnapshotVote } from '../../clients/SnapshotTypes'
import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import VotesModel from '../../entities/Votes/model'
import { VoteAttributes, VotesForProposals } from '../../entities/Votes/types'
import { getVoteByAddress, toProposalIds } from '../../entities/Votes/utils'
import { ProposalService } from '../../services/ProposalService'
import { SnapshotService } from '../../services/SnapshotService'
import Time from '../../utils/date/Time'
import { VoteService } from '../services/vote'
import { validateAddress, validateProposalId } from '../utils/validations'

export default routes((route) => {
  route.get('/proposals/:proposal/votes', handleAPI(getVotesByProposal))
  route.get('/votes', handleAPI(getCachedVotesByProposals))
  route.get('/votes/participation', handleAPI(getParticipation))
  route.get('/votes/:address', handleAPI(getVotesAndProposalsByAddress))
  route.post('/votes/top-voters', handleAPI(getTopVotersForLast30Days))
})

export async function getVotesByProposal(req: Request<{ proposal: string }>) {
  const refresh = req.query.refresh === 'true'
  const id = validateProposalId(req.params.proposal)

  const proposal = await ProposalService.getProposal(id)
  const latestVotes = await VoteService.getVotes(proposal.id)

  if (!!latestVotes.hash && Time.date(proposal.finish_at).getTime() + Time.Hour < Date.now() && !refresh) {
    return latestVotes.votes
  }

  let snapshotVotes: SnapshotVote[]
  try {
    snapshotVotes = await SnapshotGraphql.get().getVotesByProposal(proposal.snapshot_id)
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
  const votes = getVoteByAddress(snapshotVotes)
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

export async function getCachedVotesByProposals(req: Request) {
  if (!req.query.id) {
    throw new RequestError('Missing proposal IDs', RequestError.BadRequest)
  }

  const list = toProposalIds(req.query.id as string[])
  const scores = await VotesModel.findAny(list)
  return scores.reduce((result, vote) => {
    result[vote.proposal_id] = vote.votes
    return result
  }, {} as VotesForProposals)
}

async function getVotesAndProposalsByAddress(req: Request) {
  const address = validateAddress(req.params.address)
  const numFirst = Number(req.query.first)
  const numSkip = Number(req.query.skip)

  const first = Number.isInteger(numFirst) ? numFirst : undefined
  const skip = Number.isInteger(numSkip) ? numSkip : undefined

  const votes = await SnapshotService.getVotesByAddresses([address], first, skip)

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

async function getTopVotersForLast30Days(req: Request) {
  const { limit } = req.body
  const validLimit = isNumber(limit) && limit > 0 ? limit : undefined

  return await VoteService.getTopVotersForLast30Days(validLimit)
}

async function getParticipation() {
  return await VoteService.getParticipation()
}
