import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import './TokenBalanceCard.css'
import Icon from 'react-crypto-icons'
import TokensPerWalletPopup from './TokensPerWalletPopup'
import { AggregatedTokenBalance, TokenBalance } from '../../entities/Balance/types'

export type TokenBalanceCardProps = React.HTMLAttributes<HTMLDivElement> & {
  aggregatedTokenBalance: AggregatedTokenBalance
}

function formattedTokenBalance(tokenBalance: TokenBalance) {
  return parseInt(tokenBalance.amount) / 10 ** tokenBalance.decimals
}

export default function TokenBalanceCard({ aggregatedTokenBalance }: TokenBalanceCardProps) {
  const l = useFormatMessage()

  return (
    <div className="TokenBalanceCard">
      <Icon name={aggregatedTokenBalance.tokenTotal.symbol.toLowerCase()} size={45} />
      <div className="TokenBalanceCard_description">
        <div className="TokenBalanceCard_header">
          <Header sub>{aggregatedTokenBalance.tokenTotal.name.toUpperCase() + ' Tokens'}</Header>
          <TokensPerWalletPopup tokensPerWallet={aggregatedTokenBalance.tokenInWallets} />
        </div>
        <span>{l('general.number', { value: formattedTokenBalance(aggregatedTokenBalance.tokenTotal) })}</span>
      </div>
    </div>
  )
}
