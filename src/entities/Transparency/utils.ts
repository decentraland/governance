import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { BlockExplorerLink, TokenInWallet, AggregatedTokenBalance } from './types'

function alphabeticalSort(a:string, b:string) {
  return ('' + a).localeCompare(b)
}

function balanceSort(a:bigint, b:bigint) {
  if (a > b) return -1;
  if (a < b) return 1;
  return 0;
}

export function aggregateBalances(latestBalances: TokenInWallet[]):AggregatedTokenBalance[] {
  const tokenBalances:AggregatedTokenBalance[] = []
  latestBalances.map(balance => {
    let tokenBalance = tokenBalances.find(tokenBalance => tokenBalance.tokenTotal.symbol == balance.symbol)
    if(!tokenBalance){
      tokenBalances.push({
        tokenTotal: {
          symbol: balance.symbol,
          amount: balance.amount,
          quote: balance.quote
        },
        tokenInWallets: [balance]
      })
    } else {
      tokenBalance.tokenTotal.amount = tokenBalance.tokenTotal.amount + balance.amount
      tokenBalance.tokenTotal.quote = tokenBalance.tokenTotal.quote + balance.quote
      tokenBalance.tokenInWallets.push(balance)
    }
  })

  for (const tokenBalance of tokenBalances) {
    tokenBalance.tokenInWallets.sort((a, b) => alphabeticalSort(a.name, b.name))
  }
  tokenBalances.sort((a, b) => balanceSort(a.tokenTotal.amount, b.tokenTotal.amount))
  return tokenBalances
}

const ETHERSCAN_BASE_URL='https://etherscan.io/'
const POLYGON_BASE_URL='https://polygonscan.com/'

export function blockExplorerLink(wallet:TokenInWallet):BlockExplorerLink {
  const addressUrl = 'address/' + wallet.address
  switch (wallet.network){
    case 'Ethereum':
      return {name: 'Etherscan', link: ETHERSCAN_BASE_URL + addressUrl }
    case 'Polygon':
      return {name: 'Polygonscan', link: POLYGON_BASE_URL + addressUrl }
    default:
      logger.error('Unable to get block explorer link', {wallet: wallet})
      return {name: '', link: '/' }
  }
}
