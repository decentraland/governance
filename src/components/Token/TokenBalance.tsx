import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import './TokenBalance.css'
import Icon from 'react-crypto-icons'
import TokensPerWalletPopup from './TokensPerWalletPopup'
import { AggregatedTokenBalance} from '../../entities/Balance/types'
import { formattedTokenBalance } from '../../entities/Balance/utils'

export type TokenBalanceProps = React.HTMLAttributes<HTMLDivElement> & {
  aggregatedTokenBalance: AggregatedTokenBalance
}

export default function TokenBalance({aggregatedTokenBalance} : TokenBalanceProps) {
  const l = useFormatMessage()

  return (<div className='TokenBalance'>
    <Icon name={aggregatedTokenBalance.tokenTotal.name} size={45} />
    <div className="TokenBalance_description">
      <div className="TokenBalance_header">
        <Header sub>{aggregatedTokenBalance.tokenTotal.name.toUpperCase() + ' Tokens'}</Header>
        <TokensPerWalletPopup tokensPerWallet={aggregatedTokenBalance.tokenInWallets} />
      </div>
      <span>{l('general.number', { value: formattedTokenBalance(aggregatedTokenBalance.tokenTotal) })}</span>
    </div>
  </div>)
}
