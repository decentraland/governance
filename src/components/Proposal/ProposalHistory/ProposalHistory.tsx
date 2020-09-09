import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props, HistoryStep } from './ProposalHistory.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { AppName, SAB, COMMUNITY, Delay } from 'modules/app/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isVoteEnacted, isVotePassed, isVoteRejected, getVoteIdDetails } from 'modules/vote/utils'
import './ProposalHistory.css'
import { isApp } from 'modules/app/utils'

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

  getStep() {
    const { vote } = this.props
    const details = getVoteIdDetails(this.props.vote)

    if (isApp(details.appAddress, SAB)) {
      switch (true) {
        case isVoteEnacted(vote):
          return HistoryStep.SabEnacted
        case isVotePassed(vote):
          return HistoryStep.SabPassed
        case isVoteRejected(vote):
          return HistoryStep.SabRejected
        default:
          return HistoryStep.SabCreated
      }
    } else if (isApp(details.appAddress, COMMUNITY)) {
      switch (true) {
        case isVoteEnacted(vote):
          return HistoryStep.CommunityEnacted
        case isVotePassed(vote):
          return HistoryStep.CommunityPassed
        case isVoteRejected(vote):
          return HistoryStep.CommunityRejected
        default:
          return HistoryStep.CommunityCreated
      }
    } else if (isApp(details.appAddress, Delay)) {
      switch (true) {
        case isVoteEnacted(vote):
        case isVotePassed(vote):
          return HistoryStep.DelayPassed
        case isVoteRejected(vote):
          return HistoryStep.DelayRejected
        default:
          return HistoryStep.DelayCreated
      }
    } else if (isVoteRejected(vote)) {
      return HistoryStep.InboxRejected
    } else {
      return HistoryStep.InboxCreated
    }
  }

  render() {
    const step = this.getStep()

    if (step >= HistoryStep.SabCreated) {
      return <Card className="ProposalHistory">
        <Card.Content>
          <Header sub>{AppName.Voting}</Header>
        </Card.Content>
        <ProposalHistory.Created />
        {step === HistoryStep.SabRejected && <ProposalHistory.Rejected />}
        {step >= HistoryStep.SabPassed && <ProposalHistory.Passed />}
        {step >= HistoryStep.SabEnacted && <ProposalHistory.Enacted />}
      </Card>
    }

    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.Voting}</Header>
      </Card.Content>
      <ProposalHistory.Created />
      {step === HistoryStep.InboxRejected && <ProposalHistory.Rejected />}
      {step >= HistoryStep.InboxPassed && <ProposalHistory.Waiting />}
      {step === HistoryStep.DelayRejected && <ProposalHistory.Rejected />}
      {step >= HistoryStep.DelayPassed && <>
        <ProposalHistory.Passed />
        <Card.Content>
          <Header sub>{AppName.Voting}</Header>
        </Card.Content>
        <ProposalHistory.Created />
        {step >= HistoryStep.CommunityPassed && <ProposalHistory.Passed />}
        {step >= HistoryStep.CommunityEnacted && <ProposalHistory.Enacted />}
      </>}
    </Card>
  }
}
