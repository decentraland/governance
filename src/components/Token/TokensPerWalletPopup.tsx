import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { TokenInWallet } from '../../entities/Transparency/types'
import { blockExplorerLink } from '../../entities/Transparency/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Info from '../Icon/Info'

import './TokensPerWalletPopup.css'

interface Props {
  tokensPerWallet: TokenInWallet[]
  open: boolean
  onClose: (e: React.MouseEvent<unknown>) => void
}

export default function TokensPerWalletPopup({ tokensPerWallet, open, onClose }: Props) {
  const t = useFormatMessage()

  const content = (
    <Card className={'TokensPerWalletPopup__Card'}>
      <Card.Content className="TokensPerWalletPopup__Content">
        {tokensPerWallet.map((tokenInWallet, index) => {
          if (tokenInWallet.amount == BigInt(0)) return

          const explorerLink = blockExplorerLink(tokenInWallet)
          return (
            <Link
              className="TokensPerWalletPopup__Row"
              key={[tokenInWallet.name, '_popup', index].join('::')}
              href={explorerLink.link}
            >
              <div className="TokensPerWalletPopup__Block">
                <Header>{tokenInWallet.name}</Header>
                <Header sub>{tokenInWallet.network} Network</Header>
              </div>
              <div className="TokensPerWalletPopup__Block TokensPerWalletPopup__RightBlock">
                <div className={'TokensPerWalletPopup__Balance'}>
                  <Header>{t('general.number', { value: tokenInWallet.amount })}</Header>
                  <Text className="TokensPerWalletPopup__Symbol">{tokenInWallet.symbol}</Text>
                </div>
                <Header sub className="TokensPerWalletPopup__Link">
                  {t('page.transparency.mission.audit', { service_name: explorerLink.name })}
                </Header>
              </div>
            </Link>
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
      trigger={<Info size="14" />}
      eventsEnabled
      onClose={onClose}
      open={open}
      on="click"
      pinned={false}
    />
  )
}
