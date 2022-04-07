import React, { useState } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import './TokenBalanceCard.css'
import Icon from '@jparnaudo/react-crypto-icons'
import TokensPerWalletPopup from './TokensPerWalletPopup'
import { AggregatedTokenBalance } from '../../entities/Transparency/types'

export type TokenBalanceCardProps = React.HTMLAttributes<HTMLDivElement> & {
  aggregatedTokenBalance: AggregatedTokenBalance
}

export default function TokenBalanceCard({ aggregatedTokenBalance }: TokenBalanceCardProps) {
  const t = useFormatMessage()
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
        <div className="TokenBalanceCard__Header">
          <Header sub className="TokenBalanceCard__Symbol">
            {aggregatedTokenBalance.tokenTotal.symbol + ' Tokens'}
          </Header>
          {aggregatedTokenBalance.tokenTotal.amount > 0 && (
            <TokensPerWalletPopup
              tokensPerWallet={aggregatedTokenBalance.tokenInWallets}
              open={openPopup}
              onCloseHandler={onCloseHandler}
            />
          )}
        </div>
        <span>{t('general.number', { value: aggregatedTokenBalance.tokenTotal.amount })}</span>
      </div>
    </div>
  )
}
