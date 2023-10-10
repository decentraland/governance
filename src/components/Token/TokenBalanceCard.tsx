import { useState } from 'react'

import Icon from '@jparnaudo/react-crypto-icons'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { AggregatedTokenBalance } from '../../entities/Transparency/types'
import useFormatMessage from '../../hooks/useFormatMessage'

import './TokenBalanceCard.css'
import TokensPerWalletPopup from './TokensPerWalletPopup'

export type TokenBalanceCardProps = React.HTMLAttributes<HTMLDivElement> & {
  aggregatedTokenBalance: AggregatedTokenBalance
}

export default function TokenBalanceCard({ aggregatedTokenBalance }: TokenBalanceCardProps) {
  const t = useFormatMessage()
  const [openPopup, setOpenPopup] = useState(false)

  function handleClick() {
    setOpenPopup(!openPopup)
  }

  function handleClose() {
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
              onClose={handleClose}
            />
          )}
        </div>
        <span>{t('general.number', { value: aggregatedTokenBalance.tokenTotal.amount })}</span>
      </div>
    </div>
  )
}
