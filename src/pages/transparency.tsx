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
import './transparency.css'
import TokenBalanceCard from '../components/Token/TokenBalanceCard'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Governance } from '../api/Governance'

export default function WrappingPage() {
  const l = useFormatMessage()
  const [balances] = useAsyncMemo(async () => Governance.get().getBalances())

  return (<>
      {!balances && <Loader active />}
      {balances && <>
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
                  <Header>{l('page.transparency.mission.title')}</Header>
                  <p>{l('page.transparency.mission.description')}</p>
                  <JoinDiscordButton loading={false} />
                </div>
              </Grid.Column>
              <Grid.Column tablet="12" className="ProposalDetailDescription">
                <ActionableLayout className="WalletBalance">
                  <Card>
                    <Card.Content>
                      <Header>{l('page.transparency.mission.balance_title')}</Header>
                      <div className="TokenContainer">
                        {balances && balances.map((tokenBalance, index) => {
                          return <TokenBalanceCard aggregatedTokenBalance={tokenBalance}
                                                   key={['tokenBalance', index].join('::')} />
                        })}
                      </div>
                    </Card.Content>
                  </Card>
                </ActionableLayout>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </>}
    </>)
}
