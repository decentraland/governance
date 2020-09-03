import React from 'react'
import inspect from 'util-inspect'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Navigation } from 'components/Navigation'
import { ensureNetwork } from 'modules/wallet/utils'
import { getInjectedProvider } from 'decentraland-dapps/dist/providers/WalletProvider/utils'
import { Network } from 'modules/wallet/types'
import { Card, Header, Icon } from 'decentraland-ui'
import { ORGANIZATION_CONNECTOR, ORGANIZATION_LOCATION } from 'modules/organization/types'
import connect, { describeScript } from '@aragon/connect'
import { VOTING_GRAPH } from 'modules/app/types'
import { Voting } from '@aragon/connect-thegraph-voting'

type Step = {
  title: string,
  value: any
}

type State = {
  steps: Step[]
}

const styled = {
  width: '100%',
  overflow: 'auto',
  background: '#f4f4f4',
  border: '1px solid #eee',
  color: '#444',
  padding: '1em',
  borderRadius: '8px'
}

export default class DebugPage extends React.Component<{}, State> {

  state: State = {
    steps: []
  }

  async componentDidMount() {
    const steps: Step[] = []
    const provider: any = getInjectedProvider()
    const add = (title: string, value: any) => {
      console.log(title, value)
      steps.push({ title, value })
      return this.setState({ steps })
    }

    if (!provider) {
      return add('settings', 'No provider')
    }

    const network = ensureNetwork(Number(provider.chainId)) || Network.RINKEBY
    const orgConnector = ORGANIZATION_CONNECTOR[network]
    const orgLocation = ORGANIZATION_LOCATION[network]
    const votingGraph = VOTING_GRAPH[network]
    const settings = {
      network,
      orgConnector,
      orgLocation,
      provider
    }

    add('settings', settings)

    const organization = await connect(orgLocation, orgConnector, { network })
    add('organization', organization)

    const apps = await organization.apps()
    add('apps', apps)

    const votingApps = apps
      .filter(app => app.appName === "voting.aragonpm.eth")
    add('voting apps', votingApps)

    const votingList = votingApps.map(app => new Voting(app.address, votingGraph))
    add('voting', votingList)

    const votesByVoting = await Promise.all(votingList.map(voting => voting.votes()))

    const votes = await Promise.all(votesByVoting.flat().map(async (vote) => {
      const transactions = await describeScript(vote.script, votingApps)
      const description = transactions.map(tx => tx.description).filter(Boolean).join('\n')
      return {
        id: vote.id,
        metadata: vote.metadata,
        description,
        transactions,
        vote }
    }))

    add('votes', votes)
  }

  renderCode(value: any) {
    const items = Array.isArray(value) ? value : [ value ]
    return <>
      { items.map((item, i) => <pre key={'code-' + i} style={styled}>
        {inspect(item)}
      </pre>) }
    </>
  }

  render() {
    return <>
      <Navbar />
      <Navigation />
      <Page>
        <Card style={{ width: '100%' }}>
          <Card.Content>
            <Accordion
              defaultActiveIndex={[0]}
              exclusive={false}
              fluid
              panels={this.state.steps.map((step, i) => ({
                key: 'panel-' + i,
                title: <Accordion.Title>
                  <Header sub> <Icon name='dropdown' /> {step.title}</Header>
                </Accordion.Title>,
                content: <Accordion.Content>{this.renderCode(step.value)}</Accordion.Content>
              }))}
            />
          </Card.Content>
        </Card>
      </Page>
      <Footer />
    </>
  }
}
