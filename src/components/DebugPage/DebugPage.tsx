import React from "react"
import inspect from "util-inspect"
import { Page } from "decentraland-ui/dist/components/Page/Page"
import Accordion from "semantic-ui-react/dist/commonjs/modules/Accordion"
import { Navbar } from "components/Navbar"
import { Footer } from "components/Footer"
import { Navigation } from "components/Navigation"
import { ensureNetwork } from "modules/wallet/utils"
import { getInjectedProvider } from "decentraland-dapps/dist/providers/WalletProvider/utils"
import { Network } from "modules/wallet/types"
import { Card, Header, Icon, Button } from "decentraland-ui"
import { ORGANIZATION_CONNECTOR, ORGANIZATION_LOCATION } from "modules/organization/types"
import connect, { Organization, App } from "@aragon/connect"
import connectVoting, { Voting, Vote } from "@aragon/connect-voting"

type Step = {
  title: string
  value: any
}

type Data = {
  settings: any
  provider: ReturnType<typeof getInjectedProvider>
  organization: Organization
  apps: App[]
  voting_apps: App[]
  voting: Voting[]
  votes: Vote[]
}

type State = {
  data: Partial<Data>
  steps: Step[]
}

const styled = {
  width: "100%",
  overflow: "auto",
  background: "#f4f4f4",
  border: "1px solid #eee",
  color: "#444",
  padding: "1em",
  borderRadius: "8px",
}

export default class DebugPage extends React.Component<{}, State> {
  state: State = {
    data: {},
    steps: [],
  }

  async componentDidMount() {
    const steps: Step[] = []
    const data: Partial<Data> = {}
    const provider: any = getInjectedProvider()
    const add = (title: keyof Data, value: any) => {
      console.log(title, value)
      steps.push({ title, value })
      data[title] = value
      return this.setState({ steps, data })
    }

    if (!provider) {
      return add("settings", { status: "No provider" })
    }

    const network = ensureNetwork(Number(provider.chainId)) || Network.RINKEBY
    const orgConnector = ORGANIZATION_CONNECTOR[network]
    const orgLocation = ORGANIZATION_LOCATION[network]
    // const votingGraph = VOTING_GRAPH[network]
    const settings = {
      network,
      orgConnector,
      orgLocation
    }

    add("settings", settings)
    add("provider", provider)

    const organization = await connect(orgLocation, orgConnector, { network })
    add("organization", organization)

    const apps = await organization.apps()
    add("apps", apps)

    const votingApps = await organization.apps("voting")
    add("voting_apps", votingApps)

    const votingList = await Promise.all(
      votingApps.map((app) => connectVoting(app as any))
    )
    add("voting", votingList)

    const votesByVoting = await Promise.all(
      votingList.map((voting) => voting.votes())
    )

    const votes = await Promise.all(
      votesByVoting
        .flat()
        .sort((a, b) => Number(b.startDate) - Number(a.startDate))
        .map(async (vote) => {

          try {
            const { describedSteps } = await organization.describeScript(
              vote.script
            )

            const description = describedSteps
              .map((step) => step.description)
              .filter(Boolean)
              .join("\n")

            return {
              id: vote.id,
              metadata: vote.metadata,
              description,
              describedSteps,
              vote,
            }
          } catch (error) {
            return {
              id: vote.id,
              metadata: vote.metadata,
              vote,
              error
            }
          }
        })
    )

    add("votes", votes)
  }

  handleNewVote = async () => {
    const provider: any = this.state.data.provider!
    const app = this.state.data.apps!.find(
      (app) => app.address === "0x37187b0f2089b028482809308e776f92eeb7334e"
    )!
    const voting: Voting = await connectVoting(app as any)
    console.log(provider.selectedAddress)
    console.log(app)
    console.log(voting)

    const path = await app.intent("newVote", ["0x00000001", "new dao vote?"], {
      actAs: provider.selectedAddress,
    })

    console.log(path)

    path.sign((tx) =>
      provider.send({
        method: "eth_sendTransaction",
        params: [tx],
      })
    )
  }

  handlePoi = async () => {
    const provider: any = this.state.data.provider!
    const app = this.state.data.apps!.find(
      (app) => app.address === "0xde839e6cee47d9e24ac12e9215b7a45112923141"
    )!
    const voting: Voting = await connectVoting(app as any)
    console.log(provider.selectedAddress)
    console.log(app)
    console.log(voting)

    const path = await app.intent("add", ["11,11"], {
      actAs: provider.selectedAddress,
    })

    console.log(path)

    path.sign((tx) =>
      provider.send({
        method: "eth_sendTransaction",
        params: [tx],
      })
    )
  }

  handleCatalyst = async () => {
    const provider: any = this.state.data.provider!
    const app = this.state.data.apps!.find(
      (app) => app.address === "0x594709fed0d43fdf511e3ba055e4da14a8f6b53b"
    )!
    const voting: Voting = await connectVoting(app as any)
    console.log(provider.selectedAddress)
    console.log(app)
    console.log(voting)

    const path = await app.intent(
      "addCatalyst",
      ["0x326923D43226d9824aab694A3C1C566FeDa50AEb", "peer.dcl.gg"],
      {
        actAs: provider.selectedAddress,
      }
    )

    console.log(path)

    path.sign((tx) =>
      provider.send({
        method: "eth_sendTransaction",
        params: [tx],
      })
    )
  }

  handleDenyName = async () => {
    const provider: any = this.state.data.provider!
    const app = this.state.data.apps!.find(
      (app) => app.address === "0x8b8fc0e17c2900d669cc883e3b067e4135362402"
    )!
    const voting: Voting = await connectVoting(app as any)
    console.log(provider.selectedAddress)
    console.log(app)
    console.log(voting)

    const path = await app.intent("add", ["decentraland"], {
      actAs: provider.selectedAddress,
    })

    console.log(path)

    path.sign((tx) =>
      provider.send({
        method: "eth_sendTransaction",
        params: [tx],
      })
    )
  }

  handleVote = async () => {
    const provider: any = this.state.data.provider!
    const app = this.state.data.apps!.find(
      (app) => app.address === "0x37187b0f2089b028482809308e776f92eeb7334e"
    )!
    const voting: Voting = await connectVoting(app as any)
    console.log(provider.selectedAddress)
    console.log(app)
    console.log(voting)

    const path = await app.intent("vote", ["0x15", true, true], {
      actAs: provider.selectedAddress,
    })

    console.log(path)

    path.sign((tx) =>
      provider.send({
        method: "eth_sendTransaction",
        params: [tx],
      })
    )
  }

  renderCode(value: any) {
    const items = Array.isArray(value) ? value : [value]
    return (
      <>
        {items.map((item, i) => (
          <pre key={"code-" + i} style={styled}>
            {inspect(item)}
          </pre>
        ))}
      </>
    )
  }

  render() {
    return (
      <>
        <Navbar />
        <Navigation />
        <Page>
          <Button
            onClick={this.handleNewVote}
            basic
            disabled={!Boolean(this.state.data.apps)}
          >
            new vote
          </Button>
          <Button
            onClick={this.handlePoi}
            basic
            disabled={!Boolean(this.state.data.apps)}
          >
            new poi
          </Button>
          <Button
            onClick={this.handleCatalyst}
            basic
            disabled={!Boolean(this.state.data.apps)}
          >
            new catalyst
          </Button>
          <Button
            onClick={this.handleDenyName}
            basic
            disabled={!Boolean(this.state.data.apps)}
          >
            deny name
          </Button>
          <Button
            onClick={this.handleVote}
            basic
            disabled={!Boolean(this.state.data.votes)}
          >
            vote
          </Button>
          <Card style={{ width: "100%" }}>
            <Card.Content>
              <Accordion
                defaultActiveIndex={[0]}
                exclusive={false}
                fluid
                panels={this.state.steps.map((step, i) => ({
                  key: "panel-" + i,
                  title: (
                    <Accordion.Title>
                      <Header sub>
                        {" "}
                        <Icon name="dropdown" /> {step.title}
                      </Header>
                    </Accordion.Title>
                  ),
                  content: (
                    <Accordion.Content>
                      {this.renderCode(step.value)}
                    </Accordion.Content>
                  ),
                }))}
              />
            </Card.Content>
          </Card>
        </Page>
        <Footer />
      </>
    )
  }
}
