import React from 'react'

import { ChainId } from '@dcl/schemas'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useLandBalance from 'decentraland-gatsby/dist/hooks/useLandBalance'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'

import ActionableLayout from '../Layout/ActionableLayout'

import VotingPower from './VotingPower'

export const LAND_MULTIPLIER = 2000
const BUY_LAND_URL = process.env.GATSBY_BUY_LAND_URL || '#'

interface Props {
  address: string | null
}

const LandBalanceCard = ({ address }: Props) => {
  const t = useFormatMessage()
  const [land, landState] = useLandBalance(address, ChainId.ETHEREUM_MAINNET)

  return (
    <ActionableLayout
      leftAction={<Header sub>{t(`page.balance.land_label`)}</Header>}
      rightAction={
        <Button basic as={Link} href={BUY_LAND_URL} className="mobileOnly">
          {t(`page.balance.estate_action`)}
        </Button>
      }
    >
      <Card>
        <Card.Content>
          <Header>
            <b>{t(`page.balance.land_title`)}</b>
          </Header>
          <Loader size="tiny" className="balance" active={landState.loading} />
          <Stats title={t('page.balance.land_balance_label') || ''}>
            {t('page.balance.land_balance', { value: land })}
          </Stats>
          <Stats title={t('page.balance.land_total_label') || ''}>
            <VotingPower value={land! * LAND_MULTIPLIER} size="medium" />
          </Stats>
        </Card.Content>
      </Card>
    </ActionableLayout>
  )
}

export default LandBalanceCard
