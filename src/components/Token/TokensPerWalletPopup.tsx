import React from 'react'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import './TokensPerWalletPopup.css'
import { Link } from 'gatsby-plugin-intl'
import { TokenBalance } from '../../api/Alchemy'

const infoIcon = require('../../images/icons/info.svg')

export type TokensInWallet = {
  account: string,
  tokenBalance: string,
  network: string
  etherscanLink: string
}

export default function TokensPerWalletPopup() {
  const l = useFormatMessage();

  const balances:TokensInWallet[] = [
    {account: "Aragon Agent", tokenBalance: '13666468', network: "ETHEREUM", etherscanLink: "/"},
    {account: "Gnosis Safe", tokenBalance: '570045', network: "ETHEREUM", etherscanLink: "/"},
    {account: "Gnosis Safe", tokenBalance: '536432', network: "POLYGON", etherscanLink: "/"}
  ]

  const content =
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {balances.map(b => {
          return <div className="TokensPerWalletPopup__Row">
            <div className="TokensPerWalletPopup__Block">
              <Header>{b.account}</Header>
              <Header sub>{b.network} Network</Header>
            </div>
            <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
              <Header>{l('general.number', { value: b.tokenBalance })}</Header>
              <Link className="TokensPerWalletPopup__Link" to={b.etherscanLink}>
                Audit on Etherscan
              </Link>
            </div>
          </div>
        })}
      </Card.Content>
    </Card>

  return <Popup
    className="TokensPerWalletPopup"
    offset={[0, 26]}
    content={content}
    position="right center"
    trigger={<img src={infoIcon} width="14" height="14" alt="info"/>}
    on="click"
  />
}
