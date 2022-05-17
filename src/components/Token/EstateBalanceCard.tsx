import React from 'react'

import { ChainId } from '@dcl/schemas'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useEstateBalance from 'decentraland-gatsby/dist/hooks/useEstateBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'

import ActionableLayout from '../Layout/ActionableLayout'
import VotingPower from '../Token/VotingPower'

const BUY_LAND_URL = process.env.GATSBY_BUY_LAND_URL || '#'
const LAND_MULTIPLIER = 2000

interface Props {
  address: string | null
}

const EstateBalanceCard = ({ address }: Props) => {
  const t = useFormatMessage()
  const [estate, estateLand, estateState] = useEstateBalance(address, ChainId.ETHEREUM_MAINNET)

  return (
    <ActionableLayout
      rightAction={
        <Button basic as={Link} href={BUY_LAND_URL} className="screenOnly">
          {t(`page.balance.estate_action`)}
        </Button>
      }
    >
      <Card>
        <Card.Content>
          <Header>
            <b>{t(`page.balance.estate_title`)}</b>
          </Header>
          <Loader size="tiny" className="balance" active={estateState.loading} />
          <Stats title={t(`page.balance.estate_balance_label`) || ''}>
            {t('page.balance.estate_balance', { value: estate })}
          </Stats>
          <Stats title={t(`page.balance.estate_land_label`) || ''}>
            {t('page.balance.estate_land', { value: estateLand })}
          </Stats>
          <Stats title={t(`page.balance.estate_total_label`) || ''}>
            <VotingPower value={estateLand * LAND_MULTIPLIER} size="medium" />
          </Stats>
        </Card.Content>
      </Card>
    </ActionableLayout>
  )
}

export default EstateBalanceCard
