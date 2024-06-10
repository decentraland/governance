export function validateUniqueAddresses(addresses: string[]): boolean {
  const uniqueSet = new Set(addresses.map((address) => address.toLowerCase()))
  return uniqueSet.size === addresses.length
}
