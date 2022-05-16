import React from 'react'

import { ChainId } from '@dcl/schemas'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useEnsBalance from 'decentraland-gatsby/dist/hooks/useEnsBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'

import ActionableLayout from '../Layout/ActionableLayout'

import VotingPower from './VotingPower'

export const NAME_MULTIPLIER = 100
const BUY_NAME_URL = process.env.GATSBY_BUY_NAME_URL || '#'

interface Props {
  address: string | null
}

const NameBalanceCard = ({ address }: Props) => {
  const t = useFormatMessage()
  const [ens, ensState] = useEnsBalance(address, ChainId.ETHEREUM_MAINNET)

  return (
    <ActionableLayout
      leftAction={<Header sub>{t(`page.balance.name_label`)}</Header>}
      rightAction={
        <Button basic as={Link} href={BUY_NAME_URL}>
          {t(`page.balance.name_action`)}
        </Button>
      }
    >
      <Card>
        <Card.Content>
          <Header>
            <b>{t(`page.balance.name_title`)}</b>
          </Header>
          <Loader size="tiny" className="balance" active={ensState.loading} />
          <Stats title={t('page.balance.name_balance_label') || ''}>
            {t('page.balance.name_balance', { value: ens })}
          </Stats>
          <Stats title={t('page.balance.name_total_label') || ''}>
            <VotingPower value={ens * NAME_MULTIPLIER} size="medium" />
          </Stats>
        </Card.Content>
      </Card>
    </ActionableLayout>
  )
}

export default NameBalanceCard
