import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

import { ProposalAttributes } from '../entities/Proposal/types'
import { ENV } from '../shared/types/notifications'

export const NotificationType = {
  BROADCAST: 1,
  TARGET: 3,
  SUBSET: 4,
}

export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}

export function getPushNotificationsEnv(chainId: ChainId) {
  switch (chainId) {
    case ChainId.ETHEREUM_MAINNET:
      return ENV.PROD
    case ChainId.ETHEREUM_SEPOLIA:
    default:
      return ENV.STAGING
  }
}

export const Notifications = {
  ProposalVotedFinished: {
    title: (proposal: ProposalAttributes) => `Voting ended on a proposal you voted on ${proposal.title}`,
    body: 'Discover the results of the proposal you participated in as a voter. Your input matters!',
  },
  ProposalAuthoredFinished: {
    title: (proposal: ProposalAttributes) => `Voting ended on your proposal ${proposal.title}`,
    body: 'The votes are in! Find out the outcome of the voting on your proposal now',
  },
  CoAuthorRequestReceived: {
    title: 'Co-author request received',
    body: "You've been invited to collaborate as a co-author on a published proposal. Accept it or reject it here",
  },
  GrantEnacted: {
    title: 'Grant Proposal enacted',
    body: 'Congratulations! Your Grant Proposal has been successfully enacted and a Vesting Contract was added',
  },
  ProjectEnacted: {
    title: 'Your Project has been funded',
    body: 'Congratulations! Your Project has been successfully enacted and a funding Vesting Contract was created',
  },
  ProposalCommented: {
    title: (proposal: ProposalAttributes) => `New comment posted on proposal ${proposal.title}`,
    body: 'Engage in a productive conversation by replying to this comment.',
  },
  ProjectUpdateCommented: {
    title: (proposal: ProposalAttributes) => `New comment on your update for your project ${proposal.title}`,
    body: 'Engage in a productive conversation by replying to this comment.',
  },
  PitchPassed: {
    title: (proposal: ProposalAttributes) => `The Pitch "${proposal.title}" can now receive Tenders`,
    body: 'Help to advance this idea by proposing potential solutions',
  },
  TenderPassed: {
    title: (proposal: ProposalAttributes) => `The Tender "${proposal.title}" can now receive Bid Projects`,
    body: 'If think you can tackle this solution, propose a Project and get funding from the DAO',
  },
}
