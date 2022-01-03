import React, { useState } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import './TokenBalanceCard.css'
import Icon from 'react-crypto-icons'
import TokensPerWalletPopup from './TokensPerWalletPopup'
import { AggregatedTokenBalance } from '../../entities/Balance/types'
import { formattedTokenBalance } from '../../entities/Wallet/utils'

export type TokenBalanceCardProps = React.HTMLAttributes<HTMLDivElement> & {
  aggregatedTokenBalance: AggregatedTokenBalance

}

export default function TokenBalanceCard({ aggregatedTokenBalance }: TokenBalanceCardProps) {
  const l = useFormatMessage()
  const [openPopup, setOpenPopup] = useState(false)

  function handleClick() {
    setOpenPopup(!openPopup)
  }

  function onCloseHandler() {
    setOpenPopup(false)
  }

  return (
    <div className="TokenBalanceCard" onClick={handleClick}>
      <Icon name={aggregatedTokenBalance.tokenTotal.symbol.toLowerCase()} size={45} />
      <div className="TokenBalanceCard_description">
        <div className="TokenBalanceCard_header">
          <Header sub>{aggregatedTokenBalance.tokenTotal.name.toUpperCase() + ' Tokens'}</Header>
          <TokensPerWalletPopup tokensPerWallet={aggregatedTokenBalance.tokenInWallets}
                                open={openPopup}
                                onCloseHandler={onCloseHandler}
          />
        </div>
        <span>{l('general.number', { value: formattedTokenBalance(aggregatedTokenBalance.tokenTotal) })}</span>
      </div>
    </div>
  )
}
