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
  ProposalComment = 'proposal_comment',
  ProjectUpdateComment = 'project_update_comment',
  Grant = 'grant',
  TenderPassed = 'tender_passed',
  PitchPassed = 'pitch_passed',
  WhaleVote = 'whale_vote',
  VotedOnBehalf = 'voted_on_behalf',
}

export type Notification = {
  type?: number
  title: string
  body: string
  recipient: Recipient
  url: string
  customType: NotificationCustomType
}

export type DclNotification = {
  eventKey: string
  type: string
  address?: string
  metadata: object
  timestamp: number
}

export type Recipient = string | string[] | undefined
