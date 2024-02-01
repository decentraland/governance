import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

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
    case ChainId.ETHEREUM_GOERLI:
    default:
      return ENV.STAGING
  }
}

export const Notifications = {
  ProposalVotedFinished: {
    title: 'Voting Ended on a Proposal You Voted On',
    body: 'Discover the results of the proposal you participated in as a voter. Your input matters!',
  },
  ProposalAuthoredFinished: {
    title: 'Voting Ended on Your Proposal',
    body: 'The votes are in! Find out the outcome of the voting on your proposal now',
  },
  CoAuthorRequestReceived: {
    title: 'Co-author Request Received',
    body: "You've been invited to collaborate as a co-author on a published proposal. Accept it or reject it here",
  },
  GrantEnacted: {
    title: 'Grant Proposal Enacted',
    body: 'Congratulations! Your Grant Proposal has been successfully enacted and a Vesting Contract was added',
  },
}
