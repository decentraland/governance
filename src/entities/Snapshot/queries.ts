type BlockNumber = string | number | undefined
const getBlockNumberFilter = (blockNumber: BlockNumber) => (blockNumber ? 'block:{number: $blockNumber},' : '')
const getDelegationType = (key: 'delegatedTo' | 'delegatedFrom') => {
  if (key === 'delegatedTo') {
    return 'delegator'
  }

  return 'delegate'
}

export const getDelegatedQuery = (key: 'delegatedTo' | 'delegatedFrom', blockNumber?: BlockNumber) => `
query ($space: String!, $address: String!, $first: Int!, $skip: Int!, $blockNumber: Int) {
  ${key}: delegations(${getBlockNumberFilter(blockNumber)}
  where: { space_in: ["", $space], ${getDelegationType(key)}: $address },
  first: $first, skip: $skip, orderBy: timestamp, orderDirection: desc) {
    delegator
    delegate
    space
    timestamp
  }
}`
