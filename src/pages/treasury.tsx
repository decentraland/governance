import React from 'react'
import { ChainId } from '@dcl/schemas'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import ActionableLayout from '../components/Layout/ActionableLayout'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import JoinDiscordButton from '../components/Section/JoinDiscordButton'

import { useWalletBalance} from '../hooks/useWalletBalance'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { snapshotUrl} from '../entities/Proposal/utils'
import './treasury.css'
import TokenBalance from '../components/Token/TokenBalance'
require('../images/icons/info.svg')
const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''
snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)

export default function WrappingPage() {
  const l = useFormatMessage()

  // useTokenBalance
  const [aragonBalance, aragonBalanceState] = useWalletBalance('0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce', ChainId.ETHEREUM_MAINNET)
  const [multisigETHBalance, multisigETHBalanceState] = useWalletBalance('0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1', ChainId.ETHEREUM_MAINNET)
  const [multisigMATICBalance, multisigMATICBalanceState] = useWalletBalance('0xB08E3e7cc815213304d884C88cA476ebC50EaAB2', ChainId.MATIC_MAINNET)

  console.log(aragonBalance)
  console.log(multisigETHBalance)
  console.log(multisigMATICBalance)

  return (<>
    <Head
      title={l('page.treasury.title') || ''}
      description={l('page.treasury.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Navigation activeTab={NavigationTab.Treasury} />
    <Container className="VotingPowerDetail">
      <Grid stackable>
        <Grid.Row>
          <Grid.Column tablet="4">
            <div className="TreasurySectionDescription">
              <Header>Our Mission</Header>
              <p>Be as concise as posible on this instance, shouldn't be that long.
                More like a statement to get what we are showing to make sense.</p>
              <JoinDiscordButton loading={false} />
            </div>
          </Grid.Column>
          <Grid.Column tablet="12" className="ProposalDetailDescription">
            <ActionableLayout className="WalletBalance">
              <Card>
                <Card.Content>
                  <Header>Current Balance</Header>
                  <Loader size="tiny" className="balance" active={false} />
                  <div className="TokenContainer">
                    <TokenBalance title="MANA Tokens" value={11666000} iconName={'mana'} />
                    <TokenBalance title="DAI Tokens" value={627246} iconName={'dai'} />
                    <TokenBalance title="USDC Tokens" value={1124536} iconName={'usdc'} />
                    <TokenBalance title="USDT Tokens" value={607246} iconName={'usdt'} />
                  </div>
                </Card.Content>
              </Card>
            </ActionableLayout>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  </>)
}
