import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import ActionableLayout from '../components/Layout/ActionableLayout'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import JoinDiscordButton from '../components/Section/JoinDiscordButton'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { snapshotUrl} from '../entities/Proposal/utils'
import './transparency.css'
import TokenBalance from '../components/Token/TokenBalance'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Governance } from '../api/Governance'
require('../images/icons/info.svg')
const SNAPSHOT_SPACE = process.env.GATSBY_SNAPSHOT_SPACE || ''
snapshotUrl(`#/delegate/${SNAPSHOT_SPACE}`)

export default function WrappingPage() {
  const l = useFormatMessage()
  const [balances] = useAsyncMemo(async () => Governance.get().getBalances())

  console.log(balances)

  return (<>
    <Head
      title={l('page.transparency.title') || ''}
      description={l('page.transparency.description') || ''}
      image="https://decentraland.org/images/decentraland.png"
    />
    <Navigation activeTab={NavigationTab.Transparency} />
    <Container className="VotingPowerDetail">
      <Grid stackable>
        <Grid.Row>
          <Grid.Column tablet="4">
            <div className="TransparencySectionDescription">
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
                    {balances && balances.map(tokenBalance => {
                      return <TokenBalance aggregatedTokenBalance={tokenBalance}/>
                    })}
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
