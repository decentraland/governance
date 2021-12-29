import { ChainId } from '@dcl/schemas'
import { NetworkScanLink, WalletAttributes } from './types'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'

const BASE_ETHERSCAN_URL = 'https://etherscan.io/address/'
const BASE_POLYGON_URL = 'https://polygonscan.com/address/'

export function networkScanLink(wallet:WalletAttributes):NetworkScanLink {
  switch (wallet.network){
    case ChainId.ETHEREUM_MAINNET:
      return {name: 'Etherscan', link: BASE_ETHERSCAN_URL + wallet.address }
    case ChainId.MATIC_MAINNET:
      return {name: 'Polygonscan', link: BASE_POLYGON_URL + wallet.address }
    default:
      logger.error('Unable to get network scan link', {wallet: wallet})
      return {name: '', link: '/' }
  }
}
