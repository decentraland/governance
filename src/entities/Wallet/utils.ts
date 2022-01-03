import { ChainId } from '@dcl/schemas'
import { BlockExplorerLink, WalletAttributes } from './types'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { TokenBalance } from '../Balance/types'

const ETHERSCAN_BASE_URL='https://etherscan.io/'
const POLYGON_BASE_URL='https://polygonscan.com/'

export function formattedTokenBalance(tokenBalance: TokenBalance) {
  return parseInt(tokenBalance.amount) / 10 ** tokenBalance.decimals
}

export function blockExplorerLink(wallet:WalletAttributes):BlockExplorerLink {
  const addressUrl = 'address/' + wallet.address
  switch (wallet.network){
    case ChainId.ETHEREUM_MAINNET:
      return {name: 'Etherscan', link: ETHERSCAN_BASE_URL + addressUrl }
    case ChainId.MATIC_MAINNET:
      return {name: 'Polygonscan', link: POLYGON_BASE_URL + addressUrl }
    default:
      logger.error('Unable to get block explorer link', {wallet: wallet})
      return {name: '', link: '/' }
  }
}
