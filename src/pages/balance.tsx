
import React,  { useEffect, useMemo } from "react"
import { toWei } from 'web3x/utils/units'
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Stats } from "decentraland-ui/dist/components/Stats/Stats"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

import VotingPower from "../components/Token/VotingPower"
import ActionableLayout from "../components/Layout/ActionableLayout"
import Link from "decentraland-gatsby/dist/components/Text/Link"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import delay from "decentraland-gatsby/dist/utils/promise/delay"
import { useBalanceOf, useEstateBalance, useLandContract, useManaContract, useWManaContract } from "../hooks/useContract"
import useAsyncTask from "decentraland-gatsby/dist/hooks/useAsyncTask"
import useTransactionContext from "decentraland-gatsby/dist/context/Auth/useTransactionContext"
import { isPending } from "decentraland-dapps/dist/modules/transaction/utils"
import './balance.css'

const LAND_MULTIPLIER = 2000
const UNWRAPPING_TRANSACTION_ID = `unwrapping`
const BUY_MANA_URL =process.env.GATSBY_BUY_MANA_URL || '#'
const BUY_LAND_URL =process.env.GATSBY_BUY_LAND_URL || '#'

export default function WrappingPage() {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const manaContract = useManaContract()
  const wManaContract = useWManaContract()
  const landContract = useLandContract()
  const [ mana, manaState ] = useBalanceOf(manaContract)
  const [ wMana, wManaState ] = useBalanceOf(wManaContract)
  const [ land, landState ] = useBalanceOf(landContract)
  const [ estate, estateLand, estateState ] = useEstateBalance()
  const votingPower = mana! + wMana! + (land! * LAND_MULTIPLIER) + (estateLand! * LAND_MULTIPLIER)
  const [ transactions, transactionsState ] = useTransactionContext()
  const unwrappingTransaction = useMemo(() => (transactions || []).find(tx => tx.payload.id === UNWRAPPING_TRANSACTION_ID), [ transactions ])
  const [ unwrapping, unwrap ] = useAsyncTask(async () => {
    if (!wManaContract) {
      return
    }

    const amount = toWei(String(1), 'ether')
    const tx = await wManaContract.methods.withdraw(amount).send({})
    const hash = await tx.getTxHash()
    await delay(1000)
    transactionsState.add(hash, { id: UNWRAPPING_TRANSACTION_ID, amount } )
  })

  useEffect(() => {
    let cancelled = false
    if (unwrappingTransaction) {
      setTimeout(() => {
        if (!cancelled) {
          manaState.reload()
          wManaState.reload()
        }
      }, 5000)
    }

    return () => { cancelled }
  }, [ unwrappingTransaction?.status ])


  if (!account) {
    return <>
    <Navigation activeTab={NavigationTab.Activity} />
    <Container>
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
    </>
  }

  return (<>
    <Navigation activeTab={NavigationTab.Wrapping} />
    <Container className="VotingPowerSummary">
      <Stats title={l(`page.balance.total_label`) || ''}>
        <VotingPower value={votingPower} size="huge" />
      </Stats>
    </Container>
    <Container className="VotingPowerDetail">
      <ActionableLayout
        className="ManaBalance"
        leftAction={<Header sub>{l(`page.balance.mana_label`)}</Header>}
        rightAction={<Button basic as={Link} href={BUY_MANA_URL}>
          {l(`page.balance.mana_action`)}
          <Icon name="chevron right" />
        </Button>}
      >
        <Card>
          <Card.Content>
            <Header>{l(`page.balance.mana_title`)}</Header>
            <Stats title={l('page.balance.mana_balance_label') || ''}>
              <VotingPower value={mana!} size="medium" />
            </Stats>
          </Card.Content>
          {wMana! > 0 && <Card.Content style={{ flex: 0, position: 'relative' }}>
            <Stats title={l('page.balance.wrapped_balance_label') || ''}>
              <VotingPower value={wMana!} size="medium" />
            </Stats>
            <Button
              basic
              loading={unwrapping || (unwrappingTransaction?.status && isPending(unwrappingTransaction?.status!))}
              onClick={() => unwrap()}
              style={{ position: 'absolute', top: 0, right: 0, padding: '24px 20px 16px' }}
            >
              {l('page.balance.unwrap')}
            </Button>
          </Card.Content>}
        </Card>
      </ActionableLayout>
      <ActionableLayout
        className="LandBalance"
        leftAction={<Header sub>{l(`page.balance.land_label`)}</Header>}
        rightAction={<Button basic as={Link} href={BUY_LAND_URL} className="mobileOnly">
          {l(`page.balance.estate_action`)}
          <Icon name="chevron right" />
        </Button>}
      >
        <Card>
          <Card.Content>
            <Header><b>{l(`page.balance.land_title`)}</b></Header>
            <Stats title={l('page.balance.land_balance_label') || ''}>
              {l('page.balance.land_balance', { value: land })}
            </Stats>
            <Stats title={l('page.balance.land_total_label') || ''}>
              <VotingPower value={land! * LAND_MULTIPLIER} size="medium" />
            </Stats>
          </Card.Content>
        </Card>
      </ActionableLayout>
      <ActionableLayout
        className="EstateBalance"
        rightAction={<Button basic as={Link} href={BUY_LAND_URL} className="screenOnly">
          {l(`page.balance.estate_action`)}
          <Icon name="chevron right" />
        </Button>}
      >
        <Card>
          <Card.Content>
            <Header><b>{l(`page.balance.estate_title`)}</b></Header>
            <Stats title={l(`page.balance.estate_balance_label`) || ''}>
              {l('page.balance.estate_balance', { value: estate })}
            </Stats>
            <Stats title={l(`page.balance.estate_land_label`) || ''}>
              {l('page.balance.estate_land', { value: estateLand })}
            </Stats>
            <Stats title={l(`page.balance.estate_total_label`) || ''}>
              <VotingPower value={estateLand * LAND_MULTIPLIER} size="medium" />
            </Stats>
          </Card.Content>
        </Card>
      </ActionableLayout>
    </Container>
  </>)
}
