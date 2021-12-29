import React from 'react'
import { ChainId } from '@dcl/schemas'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import './TokensPerWalletPopup.css'
import { TokenInWallet, TokenBalance } from '../../entities/Balance/types'
import { blockExplorerLink } from '../../entities/Wallet/utils'

function formattedTokenBalance(tokenBalance: TokenBalance) {
  return parseInt(tokenBalance.amount) / 10 ** tokenBalance.decimals
}

const infoIcon = require('../../images/icons/info.svg')

export type TokensPerWalletPopupProps = React.HTMLAttributes<HTMLDivElement> & {
  tokensPerWallet: TokenInWallet[]
}

function networkName(network: ChainId) {
  return network == ChainId.ETHEREUM_MAINNET ? 'Ethereum' : "Polygon"
}

export default function TokensPerWalletPopup({ tokensPerWallet }: TokensPerWalletPopupProps) {
  const l = useFormatMessage();

  const content =
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {
          tokensPerWallet.map((tokenInWallet, index) => {
            const explorerLink = blockExplorerLink(tokenInWallet.wallet)
            return (<div className="TokensPerWalletPopup__Row"  key={[tokenInWallet.wallet.name, '_popup', index].join('::')}>
              <div className="TokensPerWalletPopup__Block">
                <Header>{tokenInWallet.wallet.name}</Header>
                <Header sub>{networkName(tokenInWallet.wallet.network)} Network</Header>
              </div>
              <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
                <Header>{l('general.number', { value: formattedTokenBalance(tokenInWallet.tokenBalance) })}</Header>
                <a className="TokensPerWalletPopup__Link" href={explorerLink.link} target="_blank" rel="noopener noreferrer">
                  {l('page.transparency.mission.audit', { service_name: explorerLink.name  })}
                </a>
              </div>
            </div>)
          })
        }
      </Card.Content>
    </Card>

  return <Popup
    className="TokensPerWalletPopup"
    offset={[0, 26]}
    content={content}
    position="right center"
    trigger={<img src={infoIcon} width="14" height="14" alt="info" />}
    on="click"
  />
}
