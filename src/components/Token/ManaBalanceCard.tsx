import React, { useEffect, useMemo } from 'react'

import { ChainId, Network } from '@dcl/schemas'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useTransactionContext from 'decentraland-gatsby/dist/context/Auth/useTransactionContext'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useManaBalance from 'decentraland-gatsby/dist/hooks/useManaBalance'
import delay from 'decentraland-gatsby/dist/utils/promise/delay'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Mana } from 'decentraland-ui/dist/components/Mana/Mana'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'
import { toWei } from 'web3x/utils/units'

import { useBalanceOf, useManaContract, useWManaContract } from '../../hooks/useContract'
import ActionableLayout from '../Layout/ActionableLayout'

import './ManaBalanceCard.css'
import VotingPower from './VotingPower'

const UNWRAPPING_TRANSACTION_ID = `unwrapping`
const BUY_MANA_URL = process.env.GATSBY_BUY_MANA_URL || '#'

interface Props {
  address: string | null
}

const ManaBalanceCard = ({ address }: Props) => {
  const t = useFormatMessage()
  const [maticMana, maticManaState] = useManaBalance(address, ChainId.MATIC_MAINNET)

  const wManaContract = useWManaContract()
  const [wMana, wManaState] = useBalanceOf(wManaContract, address, 'ether')

  const manaContract = useManaContract()
  const [mana, manaState] = useBalanceOf(manaContract, address, 'ether')

  const [userAddress] = useAuthContext()
  const [transactions, transactionsState] = useTransactionContext()
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
      cancelled = true
    }
  }, [manaState, unwrappingTransaction, wManaState])

  return (
    <ActionableLayout
      leftAction={<Header sub>{t(`page.balance.mana_label`)}</Header>}
      rightAction={
        <Button basic as={Link} href={BUY_MANA_URL}>
          {t(`page.balance.mana_action`)}
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
          <Card.Content className="ManaBalanceCard__WrappedManaContainer">
            <Stats title={t('page.balance.wrapped_balance_label') || ''}>
              <VotingPower value={wMana!} size="medium" />
            </Stats>
            {userAddress === address && (
              <Button
                basic
                loading={unwrapping || (unwrappingTransaction?.status && isPending(unwrappingTransaction?.status!))}
                onClick={() => unwrap()}
                className="ManaBalanceCard__WrappedManaButton"
              >
                {t('page.balance.unwrap')}
              </Button>
            )}
          </Card.Content>
        )}
      </Card>
    </ActionableLayout>
  )
}

export default ManaBalanceCard
