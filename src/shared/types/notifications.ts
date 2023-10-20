export type Notification = {
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
