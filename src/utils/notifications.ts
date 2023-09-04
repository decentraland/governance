export function getCaipAddress(address: string, chainId: number) {
  return `eip155:${chainId}:${address}`
}
