import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props } from './ProposalSummary.types'
import { ProposalStatus } from '../ProposalStatus'
import { getProposalUrl } from 'modules/proposal/utils'
import { ProposalTitle } from '../ProposalTitle'
import { getProposalInitialAddress } from 'modules/description/utils'
import { AppName, HiddenApps } from 'modules/app/types'
import { getAppName } from 'modules/app/utils'
import './ProposalSummary.css'
import { AggregatedVote } from 'modules/proposal/types'

export default class ProposalSummary extends React.PureComponent<Props, any> {

  handleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    const url = getProposalUrl(this.props.proposal)
    if (url) {
      this.props.onNavigate(url)
    }
  }

  shouldHide() {
    const { description } = this.props

    return description &&
      description.firstDescribedSteps &&
      description.firstDescribedSteps[0] &&
      description.firstDescribedSteps[0].to &&
      HiddenApps.has(description.firstDescribedSteps[0].to)
  }

  renderCategory() {
    const { proposal, description } = this.props
    const initialAddress = getProposalInitialAddress(description)
    const initialAddressName = getAppName(initialAddress)

    if ((proposal as AggregatedVote).metadata) {
      return <ProposalStatus.Badge name={AppName.Question} />

    } else if (initialAddressName) {
      return <ProposalStatus.Badge name={initialAddressName} />

    } else if (initialAddress) {
      return <ProposalStatus.Badge name={AppName.System} />

    } else {
      return null
    }
  }

  render() {
    const { proposal } = this.props
    const url = getProposalUrl(this.props.proposal)

    if (this.shouldHide()) {
      return null
    }

    return <Card as="a" className="ProposalSummary" href={url} onClick={this.handleClick}>
      <Card.Content>
        <Card.Header>
          <div><ProposalTitle proposal={proposal} /></div>
          {this.renderCategory()}
        </Card.Header>
        <div className="ProposalSummaryActions">
          <div><ProposalStatus proposal={proposal} /></div>
        </div>
      </Card.Content>
    </Card>
  }
}
