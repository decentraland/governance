// TODO: Move types to notification types file
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

export const NotificationType = {
  BROADCAST: 1,
  TARGET: 3,
  SUBSET: 4,
}

export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}

// TODO: Move to env vars
export const CHAIN_ID = 5
export const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'
