import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { TokenInWallet } from '../../entities/Transparency/types'
import { blockExplorerLink } from '../../entities/Transparency/utils'

import './TokensPerWalletPopup.css'

const infoIcon = require('../../images/icons/info.svg').default

export type TokensPerWalletPopupProps = React.HTMLAttributes<HTMLDivElement> & {
  tokensPerWallet: TokenInWallet[]
  open: boolean
  onCloseHandler: (e: React.MouseEvent<unknown>) => void
}

export default function TokensPerWalletPopup({ tokensPerWallet, open, onCloseHandler }: TokensPerWalletPopupProps) {
  const t = useFormatMessage()

  const content = (
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {tokensPerWallet.map((tokenInWallet, index) => {
          if (tokenInWallet.amount == BigInt(0)) return

          const explorerLink = blockExplorerLink(tokenInWallet)
          return (
            <a
              className="TokensPerWalletPopup__Row"
              key={[tokenInWallet.name, '_popup', index].join('::')}
              href={explorerLink.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="TokensPerWalletPopup__Block">
                <Header>{tokenInWallet.name}</Header>
                <Header sub>{tokenInWallet.network} Network</Header>
              </div>
              <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
                <div className={'TokensPerWalletPopup__Balance'}>
                  <Header>{t('general.number', { value: tokenInWallet.amount })}</Header>
                  <Paragraph tiny>{tokenInWallet.symbol}</Paragraph>
                </div>
                <Header sub className="TokensPerWalletPopup__Link">
                  {t('page.transparency.mission.audit', { service_name: explorerLink.name })}
                </Header>
              </div>
            </a>
          )
        })}
      </Card.Content>
    </Card>
  )

  return (
    <Popup
      className="TokensPerWalletPopup"
      content={content}
      position="bottom center"
      trigger={<img className="PopupIcon" src={infoIcon} width="14" height="14" alt="info" />}
      eventsEnabled={true}
      onClose={onCloseHandler}
      open={open}
      on="click"
      pinned={false}
    />
  )
}
