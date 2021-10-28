
import React,  { useEffect, useMemo } from "react"
import { ChainId, Network } from '@dcl/schemas'
import { useLocation } from "@reach/router"
import { toWei } from 'web3x/utils/units'
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Stats } from "decentraland-ui/dist/components/Stats/Stats"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import { Mana } from "decentraland-ui/dist/components/Mana/Mana"
import Navigation, { NavigationTab } from "../components/Layout/Navigation"
import Icon from 'react-crypto-icons';

import ActionableLayout from "../components/Layout/ActionableLayout"
import Link from "decentraland-gatsby/dist/components/Text/Link"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import useFeatureFlagContext from "decentraland-gatsby/dist/context/FeatureFlag/useFeatureFlagContext"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import delay from "decentraland-gatsby/dist/utils/promise/delay"
import { useBalanceOf, useWManaContract } from "../hooks/useContract"
import { useWalletBalance, getTokenName, getTokenBalance } from "../hooks/useWalletBalance"
import useAsyncTask from "decentraland-gatsby/dist/hooks/useAsyncTask"
import useEstateBalance from "decentraland-gatsby/dist/hooks/useEstateBalance"
import useTransactionContext from "decentraland-gatsby/dist/context/Auth/useTransactionContext"
import isEthereumAddress from "validator/lib/isEthereumAddress"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import useDelegation from "../hooks/useDelegation"
import useVotingPowerBalance from "../hooks/useVotingPowerBalance"
import { snapshotUrl } from "../entities/Proposal/utils"
import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Snapshot } from "../api/Snapshot"
import './treasury.css'

const NAME_MULTIPLIER = 100
const LAND_MULTIPLIER = 2000
const UNWRAPPING_TRANSACTION_ID = `unwrapping`
const SNAPSHOT_SPACE =process.env.GATSBY_SNAPSHOT_SPACE || ''
const BUY_MANA_URL =process.env.GATSBY_BUY_MANA_URL || '#'
const BUY_NAME_URL =process.env.GATSBY_BUY_NAME_URL || '#'
const BUY_LAND_URL =process.env.GATSBY_BUY_LAND_URL || '#'
const EDIT_DELEGATION = snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)

export default function WrappingPage() {
  const l = useFormatMessage()

  const [ aragonBalance, aragonBalanceState ] = useWalletBalance('0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce', ChainId.ETHEREUM_MAINNET)
  const [ multisigETHBalance, multisigETHBalanceState ] = useWalletBalance('0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1', ChainId.ETHEREUM_MAINNET)
  const [ multisigMATICBalance, multisigMATICBalanceState ] = useWalletBalance('0xB08E3e7cc815213304d884C88cA476ebC50EaAB2', ChainId.MATIC_MAINNET)

  return (<>
    <Head
      title={l('page.treasury.title') || ''}
      description={l('page.treasury.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Navigation activeTab={NavigationTab.Treasury} />
    <Container className="VotingPowerDetail">
      <ActionableLayout className="WalletBalance">
        <Card>
          <Card.Content>
            <Header><b>{l(`page.treasury.aragon`)}</b></Header>
            <Header sub>{l(`page.treasury.eth_network`)}</Header>
            <Loader size="tiny" className="balance" active={aragonBalanceState.loading}/>
            {aragonBalance.map(b => {
              return <div className="Token"><Icon name={getTokenName(b.contractAddress)} size={30} /><span>{ l('general.number', { value: getTokenBalance(b) }) }</span></div>
            })}
          </Card.Content>
        </Card>
      </ActionableLayout>
      <ActionableLayout className="WalletBalance">
        <Card>
        <Card.Content>
            <Header><b>{l(`page.treasury.multisig_eth`)}</b></Header>
            <Header sub>{l(`page.treasury.eth_network`)}</Header>
            <Loader size="tiny" className="balance" active={multisigETHBalanceState.loading}/>
            {multisigETHBalance.map(b => {
              return <div className="Token"><Icon name={getTokenName(b.contractAddress)} size={30} /><span>{ l('general.number', { value: getTokenBalance(b) }) }</span></div>
            })}
          </Card.Content>
        </Card>
      </ActionableLayout>
      <ActionableLayout className="WalletBalance">
        <Card>
        <Card.Content>
            <Header><b>{l(`page.treasury.multisig_matic`)}</b></Header>
            <Header sub>{l(`page.treasury.matic_network`)}</Header>
            <Loader size="tiny" className="balance" active={multisigMATICBalanceState.loading}/>
            {multisigMATICBalance.map(b => {
              return <div className="Token"><Icon name={getTokenName(b.contractAddress)} size={30} /><span>{ l('general.number', { value: getTokenBalance(b) }) }</span></div>
            })}
          </Card.Content>
        </Card>
      </ActionableLayout>
    </Container>
  </>)
}
