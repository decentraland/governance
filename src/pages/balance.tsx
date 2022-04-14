import './balance.css'

import { ChainId, Network } from '@dcl/schemas'
import { useLocation } from '@gatsbyjs/reach-router'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTransactionContext from 'decentraland-gatsby/dist/context/Auth/useTransactionContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useEnsBalance from 'decentraland-gatsby/dist/hooks/useEnsBalance'
import useEstateBalance from 'decentraland-gatsby/dist/hooks/useEstateBalance'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useLandBalance from 'decentraland-gatsby/dist/hooks/useLandBalance'
import useManaBalance from 'decentraland-gatsby/dist/hooks/useManaBalance'
import delay from 'decentraland-gatsby/dist/utils/promise/delay'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Mana } from 'decentraland-ui/dist/components/Mana/Mana'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import React, { useEffect, useMemo } from 'react'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import { toWei } from 'web3x/utils/units'

import { Snapshot } from '../api/Snapshot'
import DelegatedFromUserCard from '../components/Delegation/DelegatedFromUserCard'
import DelegatedToUserCard from '../components/Delegation/DelegatedToUserCard'
import ActionableLayout from '../components/Layout/ActionableLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'

import VotingPower from '../components/Token/VotingPower'
import LogIn from '../components/User/LogIn'
import UserStats from '../components/User/UserStats'
import { useBalanceOf, useWManaContract } from '../hooks/useContract'
import useDelegation from '../hooks/useDelegation'
import useVotingPowerBalance from '../hooks/useVotingPowerBalance'
import { isUnderMaintenance } from '../modules/maintenance'

const NAME_MULTIPLIER = 100
const LAND_MULTIPLIER = 2000
const UNWRAPPING_TRANSACTION_ID = `unwrapping`
const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''
const BUY_MANA_URL = process.env.GATSBY_BUY_MANA_URL || '#'
const BUY_NAME_URL = process.env.GATSBY_BUY_NAME_URL || '#'
const BUY_LAND_URL = process.env.GATSBY_BUY_LAND_URL || '#'

export default function WrappingPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [userAddress] = useAuthContext()
  const address = isEthereumAddress(params.get('address') || '') ? params.get('address') : userAddress
  const isLoggedUserProfile = userAddress === address
  const wManaContract = useWManaContract()
  const [space] = useAsyncMemo(() => Snapshot.get().getSpace(SNAPSHOT_SPACE), [SNAPSHOT_SPACE])
  const [wMana, wManaState] = useBalanceOf(wManaContract, address, 'ether')
  const [mana, manaState] = useManaBalance(address, ChainId.ETHEREUM_MAINNET)
  const [maticMana, maticManaState] = useManaBalance(address, ChainId.MATIC_MAINNET)
  const [ens, ensState] = useEnsBalance(address, ChainId.ETHEREUM_MAINNET)
  const [land, landState] = useLandBalance(address, ChainId.ETHEREUM_MAINNET)
  const [estate, estateLand, estateState] = useEstateBalance(address, ChainId.ETHEREUM_MAINNET)
  const [delegation, delegationState] = useDelegation(address, SNAPSHOT_SPACE)
  const [votingPower, votingPowerState] = useVotingPowerBalance(address, SNAPSHOT_SPACE)
  const [transactions, transactionsState] = useTransactionContext()
  const [scores, scoresState] = useAsyncMemo(
    () =>
      Snapshot.get().getLatestScores(
        space!,
        delegation.delegatedFrom.map((delegation) => delegation.delegator)
      ),
    [space, delegation.delegatedFrom],
    { callWithTruthyDeps: true }
  )
  const unwrappingTransaction = useMemo(
    () => (transactions || []).find((tx) => tx.payload.id === UNWRAPPING_TRANSACTION_ID),
    [transactions]
  )
  const [unwrapping, unwrap] = useAsyncTask(async () => {
    if (!wManaContract || !wMana) {
      return
    }

    const amount = toWei(String(wMana), 'ether')
    const tx = await wManaContract.methods.withdraw(amount).send({})
    const hash = await tx.getTxHash()
    await delay(1000)
    transactionsState.add(hash, { id: UNWRAPPING_TRANSACTION_ID, amount })
  }, [wManaContract, wMana, transactionsState])

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

    return () => {
      cancelled
    }
  }, [unwrappingTransaction?.status])

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.balance.title') || ''}
          description={t('page.balance.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Wrapping} />
        <MaintenancePage />
      </>
    )
  }

  if (!userAddress) {
    return <LogIn title={t('page.balance.title') || ''} description={t('page.balance.description') || ''} />
  }

  return (
    <div className="BalancePage">
      <Head
        title={t('page.balance.title') || ''}
        description={t('page.balance.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Wrapping} />
      <Container className="VotingPowerSummary">
        <UserStats size="huge" className="VotingPowerProfile" address={address || userAddress} />
        <Stats title={t(`page.balance.total_label`) || ''}>
          <VotingPower value={votingPower} size="huge" />
          <Loader
            size="small"
            className="balance"
            active={
              votingPowerState.loading ||
              manaState.loading ||
              wManaState.loading ||
              maticManaState.loading ||
              landState.loading ||
              estateState.loading
            }
          />
        </Stats>
      </Container>
      <Container className="VotingPowerDetail">
        <ActionableLayout
          className="ManaBalance"
          leftAction={<Header sub>{t(`page.balance.mana_label`)}</Header>}
          rightAction={
            <Button basic as={Link} href={BUY_MANA_URL}>
              {t(`page.balance.mana_action`)}
              <Icon name="chevron right" />
            </Button>
          }
        >
          <Card>
            <Card.Content>
              <Header>
                <b>{t(`page.balance.mana_title`)}</b>
              </Header>
              <Loader
                size="tiny"
                className="balance"
                active={manaState.loading || maticManaState.loading || wManaState.loading}
              />
              <Stats
                title={
                  (
                    <Mana inline network={Network.ETHEREUM}>
                      MANA
                    </Mana>
                  ) as any
                }
              >
                <VotingPower value={Math.floor(mana!)} size="medium" />
              </Stats>
              <Stats
                title={
                  (
                    <Mana inline network={Network.MATIC}>
                      MANA
                    </Mana>
                  ) as any
                }
              >
                <VotingPower value={Math.floor(maticMana!)} size="medium" />
              </Stats>
            </Card.Content>
            {wMana! > 0 && (
              <Card.Content style={{ flex: 0, position: 'relative' }}>
                <Stats title={t('page.balance.wrapped_balance_label') || ''}>
                  <VotingPower value={wMana!} size="medium" />
                </Stats>
                {userAddress === address && (
                  <Button
                    basic
                    loading={unwrapping || (unwrappingTransaction?.status && isPending(unwrappingTransaction?.status!))}
                    onClick={() => unwrap()}
                    style={{ position: 'absolute', top: 0, right: 0, padding: '24px 20px 16px' }}
                  >
                    {t('page.balance.unwrap')}
                  </Button>
                )}
              </Card.Content>
            )}
          </Card>
        </ActionableLayout>
        <ActionableLayout
          className="LandBalance"
          leftAction={<Header sub>{t(`page.balance.land_label`)}</Header>}
          rightAction={
            <Button basic as={Link} href={BUY_LAND_URL} className="mobileOnly">
              {t(`page.balance.estate_action`)}
              <Icon name="chevron right" />
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
        <ActionableLayout
          className="EstateBalance"
          rightAction={
            <Button basic as={Link} href={BUY_LAND_URL} className="screenOnly">
              {t(`page.balance.estate_action`)}
              <Icon name="chevron right" />
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
        <ActionableLayout
          className="NameBalance"
          leftAction={<Header sub>{t(`page.balance.name_label`)}</Header>}
          rightAction={
            <Button basic as={Link} href={BUY_NAME_URL}>
              {t(`page.balance.name_action`)}
              <Icon name="chevron right" />
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

        <DelegatedToUserCard
          isLoggedUserProfile={isLoggedUserProfile}
          delegation={delegation}
          scores={scores}
          loading={delegationState.loading || scoresState.loading}
        />

        <DelegatedFromUserCard isLoggedUserProfile={isLoggedUserProfile} delegation={delegation} />
      </Container>
    </div>
  )
}
