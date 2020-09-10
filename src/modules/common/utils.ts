import addresses from './addresses.json'

export function getAddressName(address?: string) {
  return address && (addresses as Record<string, string>)[address.toLowerCase()]
}
