import JobContext from "decentraland-gatsby/dist/entities/Job/context";
import { updateSnapshotProposalVotes, getSnapshotProposalVotes } from "../Votes/routes";
import { Vote } from "../Votes/types";
import ProposalModel from "./model";
import { INVALID_PROPOSAL_POLL_OPTIONS, ProposalAttributes, ProposalStatus } from "./types";

import * as templates from './templates';
import { dropSnapshotProposal } from './routes'
import { IPFS, HashContent } from '../../api/IPFS';
import Time from 'decentraland-gatsby/dist/utils/date/Time';
import { Discourse, DiscoursePost } from '../../api/Discourse';
import { AlchemyProvider, Block } from '@ethersproject/providers'
import { proposalUrl, snapshotProposalUrl, forumUrl } from './utils';
import { DISCOURSE_AUTH, DISCOURSE_CATEGORY } from '../Discourse/utils';
import Catalyst, { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst';
import { Snapshot, SnapshotResult, SnapshotSpace, SnapshotStatus } from '../../api/Snapshot';
import { SNAPSHOT_SPACE, SNAPSHOT_ACCOUNT, SNAPSHOT_ADDRESS, SNAPSHOT_DURATION, signMessage } from '../Snapshot/utils';

export async function activateProposals(context: JobContext) {
  const activatedProposals = await ProposalModel.activateProposals()
  context.log(activatedProposals === 0 ? `No activated proposals` : `Activated ${activatedProposals} proposals...`)
}

export async function createProposals(context: JobContext) {
const pendingProposals = await ProposalModel.getCreatingProposal()

  context.log('Creating proposals: ' + pendingProposals.length)
  pendingProposals.forEach(proposal => createProposal(proposal))
}

async function createProposal(proposal: ProposalAttributes) {
  let profile: Avatar | null
  const proposal_url = proposalUrl(proposal)
  const start = Time.utc().set('seconds', 0)
  const end = Time.utc(start).add(SNAPSHOT_DURATION, 'seconds')

  try {
    profile = await Catalyst.get().getProfile(proposal.user)
  } catch (err) {
    throw new Error(`Error getting profile "${proposal.user}"`)
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
    throw new Error(`Error getting snapshot space "${SNAPSHOT_SPACE}"`)
  }

  try {
    const provider = new AlchemyProvider(Number(snapshotSpace.network), process.env.ALCHEMY_API_KEY)
    block = await provider.getBlock('latest')
  } catch (err) {
    throw new Error(`Couldn't get the latest block`)
  }

  try {
    const snapshotTemplateProps: templates.SnapshotTemplateProps = {
      user: proposal.user,
      type: proposal.type,
      configuration: proposal.configuration,
      profile,
      proposal_url
    }

    msg = await Snapshot.get().createProposalMessage(SNAPSHOT_SPACE,
      snapshotStatus.version, snapshotSpace.network, snapshotSpace.strategies, {
      name: await templates.snapshotTitle(snapshotTemplateProps),
      body: await templates.snapshotDescription(snapshotTemplateProps),
      choices: proposal.configuration.choices,
      snapshot: block.number,
      end,
      start,
    })
  } catch (err) {
    throw new Error(`Error creating the snapshot message`)
  }

  //
  // Create proposal in Snapshot
  //
  let snapshotProposal: SnapshotResult
  try {
    const sig = await signMessage(SNAPSHOT_ACCOUNT, msg)
    console.log(sig, msg)
    snapshotProposal = await Snapshot.get().send(SNAPSHOT_ADDRESS, msg, sig)
  } catch (err) {
    throw new Error(`Couldn't create proposal in snapshot`)
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
    throw new Error(`Couldn't retrieve proposal from the IPFS`)
  }

  //
  // Create proposal in Discourse
  //
  let discourseProposal: DiscoursePost
  try {
    const discourseTemplateProps: templates.ForumTemplateProps = {
      type: proposal.type,
      configuration: proposal.configuration,
      user: proposal.user,
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
    throw new Error(`Forum error: ${err.body.errors.join(', ')}`)
  }

  const forum_url = forumUrl({ discourse_topic_slug: discourseProposal.topic_slug, discourse_topic_id: discourseProposal.topic_id })
  console.log(`Discourse proposal created:`, forum_url, JSON.stringify(discourseProposal))

  //
  // Update proposal in DB
  //
  const update: Partial<ProposalAttributes> = {
    status: ProposalStatus.Active,
    snapshot_id: snapshotProposal.ipfsHash,
    snapshot_proposal: JSON.stringify(JSON.parse(snapshotContent.msg).payload),
    snapshot_signature: snapshotContent.sig,
    snapshot_network: snapshotSpace.network,
    discourse_id: discourseProposal.id,
    discourse_topic_id: discourseProposal.topic_id,
    discourse_topic_slug: discourseProposal.topic_slug,
    start_at: start.toJSON() as any,
    finish_at: end.toJSON() as any,
    updated_at: new Date(),
  }
  await ProposalModel.update(update, { id: proposal.id })
  console.log(`Proposal updated!`)
}

function sameOptions(options: string[], expected: string[]) {
  if (options.length !== expected.length) {
    return false
  }

  options = options.map(option => option.toLowerCase()).sort()
  expected = expected.map(option => option.toLowerCase()).sort()
  return options.every((option, i) => option === expected[i])
}

export async function finishProposal(context: JobContext) {
  const pendingProposals = await ProposalModel.getFinishedProposal()
  if (pendingProposals.length === 0) {
    context.log(`No finished proposals...`)
    return
  }

  context.log(`Updating ${pendingProposals.length} proposals...`)
  const finishedProposals: ProposalAttributes[] = []
  const accetedProposals: ProposalAttributes[] = []
  const rejectedProposals: ProposalAttributes[] = []

  for (const proposal of pendingProposals) {
    const invalidOption = INVALID_PROPOSAL_POLL_OPTIONS.toLocaleLowerCase()
    const choices = (proposal.configuration.choices || []).map((choice: string) => choice.toLowerCase())
    const isYesNo = sameOptions(choices, ['yes', 'no'])
    const isAcceptReject = sameOptions(choices, ['accept', 'reject', invalidOption])
    const isForAgainst = sameOptions(choices, ['for', 'against', invalidOption])
    const snapshotVotes = await getSnapshotProposalVotes(proposal)
    const votes: Record<string, Vote> = await updateSnapshotProposalVotes(proposal, snapshotVotes)
    const voters = Object.keys(votes)

    const result: Record<string, number> = {}
    for (const choice of choices)  {
      result[choice] = 0
    }

    for (const voter of voters) {
      const vote = votes[voter]
      const choice = vote.choice - 1
      result[choices[choice]] = result[choices[choice]] + vote.vp
    }

    const winnerChoice = Object.keys(result).reduce((winner, choice) => {
      if (!winner || result[winner] < result[choice]) {
        return choice
      }

      return winner
    })

    const winnerVotingPower = Object.keys(result).reduce((winner, choice) => {
      if (!winner || winner < result[choice]) {
        return result[choice]
      }

      return winner
    }, 0)

    // reject empty proposals or proposals without the minimum vp required
    const minimumVotingPowerRequired = proposal.required_to_pass || 0
    if (winnerVotingPower === 0 || winnerVotingPower < minimumVotingPowerRequired) {
      rejectedProposals.push(proposal)

      // reject if the invalid option won
    } else if (winnerChoice === invalidOption) {
      rejectedProposals.push(proposal)

    // reject/pass boolean proposals
    } else if (isYesNo || isAcceptReject || isForAgainst) {
      if (
        isYesNo && result['yes'] > result['no'] ||
        isAcceptReject && result['accept'] > result['reject'] ||
        isForAgainst && result['for'] > result['against']
      ) {
        accetedProposals.push(proposal)
      } else {
        rejectedProposals.push(proposal)
      }

    // Finish otherwise
    } else {
      finishedProposals.push(proposal)
    }
  }

  if (finishedProposals.length > 0) {
    context.log(`Finishing ${finishedProposals.length} proposals...`)
    await ProposalModel.finishProposal(finishedProposals.map(proposal => proposal.id), ProposalStatus.Finished)
  }

  if (accetedProposals.length > 0) {
    context.log(`Accepting ${accetedProposals.length} proposals...`)
    await ProposalModel.finishProposal(accetedProposals.map(proposal => proposal.id), ProposalStatus.Passed)
  }

  if (rejectedProposals.length > 0) {
    context.log(`Rejecting ${rejectedProposals.length} proposals...`)
    await ProposalModel.finishProposal(rejectedProposals.map(proposal => proposal.id), ProposalStatus.Rejected)
  }
}
