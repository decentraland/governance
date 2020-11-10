import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props } from './ProposalHistory.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { SAB, COMMUNITY, AppName, Delay } from 'modules/app/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isApp } from 'modules/app/utils'
import { DelayedScript, ProposalStatus } from 'modules/proposal/types'
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

  static WaitingExecution() {
    return <Card.Content>
      <img src={waiting} width="36" height="36" alt="waiting" />
      <Header>{t('general.waiting_execution')}</Header>
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
    const { proposal } = this.props
    const enacted = proposal.status === ProposalStatus.Enacted
    const passed = enacted || proposal.status === ProposalStatus.Passed
    const rejected = proposal.status === ProposalStatus.Rejected
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
    const { proposal } = this.props
    const enacted = proposal.status === ProposalStatus.Enacted
    const passed = enacted || proposal.status === ProposalStatus.Passed
    const rejected = proposal.status === ProposalStatus.Rejected
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
    const proposal = this.props.proposal as DelayedScript
    const passed = proposal.executionTime * 100 < Date.now()
    const waiting = !passed || proposal.canExecute
    const waitingExecution = passed && !proposal.canExecute
    const executed = passed && proposal.canExecute
    // const rejected = proposal.status === ProposalStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {waiting && <ProposalHistory.Waiting />}
      {waitingExecution && <ProposalHistory.WaitingExecution />}
      {executed && <ProposalHistory.Passed />}
    </Card>
  }

  renderINBOX() {
    const { proposal } = this.props
    const rejected = proposal.status === ProposalStatus.Rejected
    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {rejected && <ProposalHistory.Rejected />}
    </Card>
  }

  render() {
    const identifier = this.props.proposal.identifier

    if (isApp(identifier.appAddress, SAB)) {
      return this.renderSAB()
    }

    if (isApp(identifier.appAddress, COMMUNITY)) {
      return this.renderCOMMUNITY()
    }

    if (isApp(identifier.appAddress, Delay)) {
      return this.renderDelay()
    }

    return this.renderINBOX()
  }
}
