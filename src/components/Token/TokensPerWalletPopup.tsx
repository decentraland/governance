import React from 'react'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import './TokensPerWalletPopup.css'
import { Link } from 'gatsby-plugin-intl'
import { TokenInWallet } from '../../entities/Balance/types'
import { formattedTokenBalance } from '../../entities/Balance/utils'
import { networkScanLink } from '../../entities/Wallet/utils'

const infoIcon = require('../../images/icons/info.svg')

export type TokensPerWalletPopupProps = React.HTMLAttributes<HTMLDivElement> & {
  tokensPerWallet: TokenInWallet[]
}

export default function TokensPerWalletPopup({ tokensPerWallet }: TokensPerWalletPopupProps) {
  const l = useFormatMessage();

  const content =
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {
          tokensPerWallet.map(tokenInWallet => {
            const scanLink = networkScanLink(tokenInWallet.wallet)
            return <div className="TokensPerWalletPopup__Row">
              <div className="TokensPerWalletPopup__Block">
                <Header>{tokenInWallet.wallet.name}</Header>
                <Header sub>{tokenInWallet.wallet.network} Network</Header>
              </div>
              <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
                <Header>{l('general.number', { value: formattedTokenBalance(tokenInWallet.tokenBalance) })}</Header>
                <Link className="TokensPerWalletPopup__Link" to={scanLink.link}>
                  {l('general.number') + scanLink.name})
                </Link>
              </div>
            </div>
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
