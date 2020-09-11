import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props } from './ProposalSummary.types'
import { ProposalStatus } from '../ProposalStatus'
import { getVoteUrl } from 'modules/vote/utils'
import { ProposalTitle } from '../ProposalTitle'
import { getVoteInitialAddress } from 'modules/description/utils'
import { AppName, HiddenApps } from 'modules/app/types'
import { getAppName } from 'modules/app/utils'
import './ProposalSummary.css'

export default class ProposalSummary extends React.PureComponent<Props, any> {

  handleClick = (event: React.MouseEvent<any>) => {
    event.preventDefault()
    const url = getVoteUrl(this.props.vote)
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

  render() {
    const { vote, description } = this.props
    const initialAddress = getVoteInitialAddress(description)
    const initialAddressName = getAppName(initialAddress)
    const url = getVoteUrl(this.props.vote)

    if (this.shouldHide()) {
      return null
    }

    return <Card as="a" className="ProposalSummary" href={url} onClick={this.handleClick}>
      <Card.Content>
        <Card.Header>
          <div><ProposalTitle vote={vote} /></div>
          {vote.metadata && <ProposalStatus.Badge name={AppName.Question} />}
          {!vote.metadata && initialAddressName && <ProposalStatus.Badge name={initialAddressName} />}
          {!vote.metadata && !initialAddressName && initialAddress && <ProposalStatus.Badge name={AppName.System} />}
        </Card.Header>
        <div className="ProposalSummaryActions">
          <div><ProposalStatus vote={vote} /></div>
        </div>
      </Card.Content>
    </Card>
  }
}
