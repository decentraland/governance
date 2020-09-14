import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props } from './ProposalHistory.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SAB, COMMUNITY, AppName } from 'modules/app/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isApp } from 'modules/app/utils'
import { VoteStatus } from 'modules/vote/types'
import './ProposalHistory.css'

const created = require('../../../images/history-created.svg')
const waiting = require('../../../images/history-waiting.svg')
const rejected = require('../../../images/history-rejected.svg')
const passed = require('../../../images/history-passed.svg')
const enacted = require('../../../images/history-enacted.svg')

export default class ProposalHistory extends React.PureComponent<Props, any> {

  static Created() {
    return <Card.Content>
    <img src={created} width="36" height="36" alt="created" />
      <Header>{t('general.created')}</Header>
    </Card.Content>
  }

  static Waiting() {
    return <Card.Content>
      <img src={waiting} width="36" height="36" alt="waiting" />
      <Header>{t('general.under_review')}</Header>
    </Card.Content>
  }

  static Rejected() {
    return <Card.Content>
    <img src={rejected} width="36" height="36" alt="rejected" />
      <Header>{t('general.rejected')}</Header>
    </Card.Content>
  }

  static Passed() {
    return <Card.Content>
    <img src={passed} width="36" height="36" alt="passed" />
      <Header>{t('general.passed')}</Header>
    </Card.Content>
  }

  static Enacted() {
    return <Card.Content>
    <img src={enacted} width="36" height="36" alt="enacted" />
      <Header>{t('general.enacted')}</Header>
    </Card.Content>
  }

  renderSAB() {
    const { vote } = this.props
    const enacted = vote.status === VoteStatus.Enacted
    const passed = enacted || vote.status === VoteStatus.Passed
    const rejected = vote.status === VoteStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.SAB}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {passed && <ProposalHistory.Passed />}
      {enacted && <ProposalHistory.Enacted />}
      {rejected && <ProposalHistory.Rejected />}
    </Card>
  }

  renderCOMMUNITY() {
    const { vote } = this.props
    const enacted = vote.status === VoteStatus.Enacted
    const passed = enacted || vote.status === VoteStatus.Passed
    const rejected = vote.status === VoteStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      <ProposalHistory.Waiting />
      <ProposalHistory.Passed />
      <Card.Content>
        <Header sub>{AppName.COMMUNITY}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {passed && <ProposalHistory.Passed />}
      {enacted && <ProposalHistory.Enacted />}
      {rejected && <ProposalHistory.Rejected />}
    </Card>
  }

  renderDelay() {
    const { vote } = this.props
    const enacted = vote.status === VoteStatus.Enacted
    const passed = enacted || vote.status === VoteStatus.Passed
    const rejected = vote.status === VoteStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      <ProposalHistory.Waiting />
      {passed && <ProposalHistory.Passed />}
      {rejected && <ProposalHistory.Rejected />}
    </Card>
  }

  renderINBOX() {
    const { vote } = this.props
    const enacted = vote.status === VoteStatus.Enacted
    const passed = enacted || vote.status === VoteStatus.Passed
    const rejected = vote.status === VoteStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {passed && <ProposalHistory.Waiting />}
      {rejected && <ProposalHistory.Rejected />}
    </Card>
  }

  render() {
    const identifier = this.props.vote.identifier

    if (isApp(identifier.appAddress, SAB)) {
      return this.renderSAB()
    }

    if (isApp(identifier.appAddress, COMMUNITY)) {
      return this.renderCOMMUNITY()
    }

    return this.renderINBOX()
  }
}
