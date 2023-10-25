export type PushNotification = {
  payload_id: number
  epoch: string
  payload: {
    data: {
      acta: string
      asub: string
      amsg: string
      additionalMeta: {
        data: string
      }
    }
  }
}

export enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
}

export enum NotificationCustomType {
  Announcement = 'announcement',
  Proposal = 'proposal',
  Grant = 'grant',
}

export type Notification = {
  type?: number
  title: string
  body: string
  recipient: Recipient
  url: string
  customType: NotificationCustomType
}

export type Recipient = string | string[] | undefined

export enum GovernanceNotificationType {
  ProposalVotedFinished,
  ProposalAuthoredFinished,
  CoAuthorRequestReceived,
  GrantEnacted,
}

export const NotificationTitle: Record<GovernanceNotificationType, string> = {
  [GovernanceNotificationType.ProposalVotedFinished]: 'Voting Ended on a Proposal You Voted On',
  [GovernanceNotificationType.ProposalAuthoredFinished]: 'Voting Ended on Your Proposal',
  [GovernanceNotificationType.CoAuthorRequestReceived]: 'Co-author Request Received',
  [GovernanceNotificationType.GrantEnacted]: 'Grant Proposal Enacted',
}

export const NotificationBody: Record<GovernanceNotificationType, string> = {
  [GovernanceNotificationType.ProposalVotedFinished]:
    'Discover the results of the proposal you participated in as a voter. Your input matters!',
  [GovernanceNotificationType.ProposalAuthoredFinished]:
    'The votes are in! Find out the outcome of the voting on your proposal now',
  [GovernanceNotificationType.CoAuthorRequestReceived]:
    "You've been invited to collaborate as a co-author on a published proposal. Accept it or reject it here",
  [GovernanceNotificationType.GrantEnacted]:
    'Congratulations! Your Grant Proposal has been successfully enacted and a Vesting Contract was added',
}
