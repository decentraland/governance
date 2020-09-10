import contracts from './contracts.json'

const addresses = new Map<string, string>()

for (const contractMap of Object.values(contracts)) {
  for (const contractName of Object.keys(contractMap)) {
    addresses.set(contractMap[contractName as keyof typeof contractMap].toLowerCase(), contractName)
  }
}

export function getAddressName(address?: string) {
  return addresses.get(address?.toLowerCase() || '')
}
