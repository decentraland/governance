import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props } from './ProposalSummary.types'
import { ProposalStatus } from '../ProposalStatus'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { getVoteUrl } from 'modules/vote/utils'
import { Loader } from 'decentraland-ui'
import './ProposalSummary.css'

export default class ProposalSummary extends React.PureComponent<Props, any> {

  handleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    const url = getVoteUrl(this.props.vote)
    if (url) {
      this.props.onNavigate(url)
    }
  }

  getDescription() {
    const { vote, description, descriptionError } = this.props
    if (vote.metadata) {
      return <Header>{vote.metadata}</Header>
    }

    if (descriptionError) {
      return <Header>{descriptionError}</Header>
    }

    if (description) {
      if (description.description) {
        return <Header>{description.description}</Header>
      }

      return <Header sub>No description</Header>
    }

    return <Loader active inline size="small" />
  }

  render() {
    const { vote } = this.props
    const url = getVoteUrl(this.props.vote)
    return <Card as="a" className="ProposalSummary" href={url} onClick={this.handleClick}>
      <Card.Content>
        <Card.Header>
          {this.getDescription()}
          <ProposalStatus.Creator address={vote.creator} />
        </Card.Header>
        <div className="ProposalSummaryActions">
          <div><ProposalStatus vote={vote} /></div>
        </div>
      </Card.Content>
    </Card>
  }
}
