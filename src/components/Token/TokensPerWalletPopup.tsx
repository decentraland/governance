import React from 'react'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import './TokensPerWalletPopup.css'
import { Link } from 'gatsby-plugin-intl'

const infoIcon = require('../../images/icons/info.svg')

export default function TokensPerWalletPopup() {
  const l = useFormatMessage();

  const content =
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        <div className="TokensPerWalletPopup__Row">
          <div className="TokensPerWalletPopup__Block">
            <Header>Aragon Agent</Header>
            <Header sub>Ethereum Network</Header>
          </div>
          <div className="TokensPerWalletPopup__Block">
            <Header>{l('general.number', { value: 13666468 })}</Header>
            <Link className="TokensPerWalletPopup__Link" to={''}>
              Audit on Etherscan
            </Link>
          </div>
        </div>
        <div className="TokensPerWalletPopup__Row">
          <div className="TokensPerWalletPopup__Block">
            <Header>Aragon Agent</Header>
            <Header sub>Ethereum Network</Header>
          </div>
          <div className="TokensPerWalletPopup__Block">
            <Header>{l('general.number', { value: 13666468 })}</Header>
            <Link className="TokensPerWalletPopup__Link" to={''}>
              Audit on Etherscan
            </Link>
          </div>
        </div>
        <div className="TokensPerWalletPopup__Row">
          <div className="TokensPerWalletPopup__Block">
            <Header>Aragon Agent</Header>
            <Header sub>Ethereum Network</Header>
          </div>
          <div className="TokensPerWalletPopup__Block">
            <Header>{l('general.number', { value: 13666468 })}</Header>
            <Link className="TokensPerWalletPopup__Link" to={''}>
              Audit on Etherscan
            </Link>
          </div>
        </div>
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
