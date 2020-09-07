import { Vote } from 'modules/vote/types'

export type Props = {
  vote: Vote
}

export enum HistoryStep {
  InboxCreated,
  InboxRejected,
  InboxPassed,
  DelayCreated,
  DelayRejected,
  DelayPassed,
  CommunityCreated,
  CommunityRejected,
  CommunityPassed,
  CommunityEnacted,
  SabCreated,
  SabRejected,
  SabPassed,
  SabEnacted
}