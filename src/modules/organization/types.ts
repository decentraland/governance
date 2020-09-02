import { Organization } from '@aragon/connect'
import { Network } from 'modules/wallet/types'

export const ORGANIZATION_LOCATION = {
  [Network.MAINNET]: 'dcl.eth',
  [Network.RINKEBY]: 'dcl.aragonid.eth'
}

export const ORGANIZATION_CONNECTOR = {
  [Network.MAINNET]: 'thegraph',
  [Network.RINKEBY]: 'thegraph'
}

export { Organization }
