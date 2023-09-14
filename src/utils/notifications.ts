// TODO: Move to notification types file
export type Notification = {
  payload_id: number
  payload: {
    data: {
      asub: string
      amsg: string
    }
  }
}

export const NotificationType = {
  BROADCAST: 1,
  TARGET: 3,
  SUBSET: 4,
}

export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}
