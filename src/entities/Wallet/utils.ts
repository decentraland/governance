import { ChainId } from '@dcl/schemas'
import { BlockExplorerLink, WalletAttributes } from './types'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'

export function blockExplorerLink(wallet:WalletAttributes):BlockExplorerLink {
  const addressUrl = 'address/' + wallet.address
  switch (wallet.network){
    case ChainId.ETHEREUM_MAINNET:
      return {name: 'Etherscan', link: process.env.ETHERSCAN_BASE_URL + addressUrl }
    case ChainId.MATIC_MAINNET:
      return {name: 'Polygonscan', link: process.env.POLYGON_BASE_URL + addressUrl }
    default:
      logger.error('Unable to get block explorer link', {wallet: wallet})
      return {name: '', link: '/' }
  }
}
