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

export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}
