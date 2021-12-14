import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import './TokenBalance.css'
import Icon from 'react-crypto-icons'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import TokensPerWalletPopup from './TokensPerWalletPopup'

export type TokenBalanceProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  iconName: string
  value: number | bigint
}

export default function TokenBalance({title, iconName, value, ...props }: TokenBalanceProps) {
  const l = useFormatMessage()

  return (<div {...props}
               className={TokenList.join([
                 'TokenBalance',
                 props.className
               ])}>
    <Icon name={iconName} size={45} />
    <div className="TokenBalance_description">
      <div className="TokenBalance_header">
        <Header sub>{title}</Header>
        <TokensPerWalletPopup/>
      </div>
      <span>{l('general.number', { value: value })}</span>
    </div>
  </div>)
}
