import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { formatUnits } from '@ethersproject/units'
import { MANA_GRAPH_BY_CHAIN_ID } from 'decentraland-dapps/dist/lib/chainConfiguration'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { ErrorClient } from '../clients/ErrorClient'

export async function fetchManaBalance(address: string, chainId: ChainId) {
  if (!isEthereumAddress(address)) {
    return 0
  }

  try {
    const response = await fetch(MANA_GRAPH_BY_CHAIN_ID[chainId], {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
        query ($address: String!) {
          accounts(where: { id: $address }) {
            id,
            mana
          }
        }
        `,
        variables: { address: address.toLowerCase() },
      }),
    })

    const body = await response.json()
    const accounts = body?.data?.accounts || []
    const account = accounts[0]
    const mana = account?.mana || '0'
    return parseFloat(formatUnits(mana, 'ether'))
  } catch (err) {
    console.error(err)
    ErrorClient.report('Error fetching MANA balance', { address, chainId })

    return 0
  }
}
