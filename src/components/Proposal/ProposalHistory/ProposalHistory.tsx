import React from 'react'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Props, HistoryStep } from './ProposalHistory.types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { AppName, APP_NAME } from 'modules/app/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { isVoteEnacted, isVotePassed, isVoteRejected } from 'modules/vote/utils'
import './ProposalHistory.css'

const created = require('../../../images/history-created.svg')
const waiting = require('../../../images/history-waiting.svg')
const rejected = require('../../../images/history-rejected.svg')
const passed = require('../../../images/history-passed.svg')
const enacted = require('../../../images/history-enacted.svg')

export default class ProposalHistory extends React.PureComponent<Props, any> {

  getStep() {
    const { vote } = this.props
    const address: keyof typeof APP_NAME = vote.appAddress as any
    const name = APP_NAME[address]

    if (name === AppName.SAB) {
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
    } else if (name === AppName.COMMUNITY) {
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
    } else if (name === AppName.Delay) {
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
      return <Card className="ProposalHistory"><Card.Content>
        <Header sub>{AppName.SAB}</Header>
        </Card.Content>
        <Card.Content>
          <img src={created} width="36" height="36" />
          <Header>{t('general.created')}</Header>
        </Card.Content>
        {step === HistoryStep.SabRejected && <Card.Content>
          <img src={rejected} width="36" height="36" />
          <Header>{t('general.rejected')}</Header>
        </Card.Content>}
        {step >= HistoryStep.SabPassed && <Card.Content>
          <img src={passed} width="36" height="36" />
          <Header>{t('general.passed')}</Header>
        </Card.Content>}
        {step >= HistoryStep.SabEnacted && <Card.Content>
          <img src={enacted} width="36" height="36" />
          <Header>{t('general.enacted')}</Header>
        </Card.Content>}
      </Card>
    }

    return <Card className="ProposalHistory">
      <Card.Content>
        <Header sub>{AppName.INBOX}</Header>
      </Card.Content>
      <Card.Content>
        <img src={created} width="36" height="36" />
        <Header>{t('general.created')}</Header>
      </Card.Content>
      {step === HistoryStep.InboxRejected && <Card.Content>
        <img src={rejected} width="36" height="36" />
        <Header>{t('general.rejected')}</Header>
      </Card.Content>}
      {step >= HistoryStep.InboxPassed && <Card.Content>
        <img src={waiting} width="36" height="36" />
        <Header>{t('general.under_review')}</Header>
      </Card.Content>}
      {step === HistoryStep.DelayRejected && <Card.Content>
        <img src={rejected} width="36" height="36" />
        <Header>{t('general.rejected')}</Header>
      </Card.Content>}
      {step >= HistoryStep.DelayPassed && <>
        <Card.Content>
          <img src={passed} width="36" height="36" />
          <Header>{t('general.passed')}</Header>
        </Card.Content>
        <Card.Content>
          <Header sub>{AppName.COMMUNITY}</Header>
        </Card.Content>
        <Card.Content>
          <img src={created} width="36" height="36" />
          <Header>{t('general.created')}</Header>
        </Card.Content>
        {step >= HistoryStep.CommunityPassed && <Card.Content>
          <img src={passed} width="36" height="36" />
          <Header>{t('general.passed')}</Header>
        </Card.Content>}
        {step >= HistoryStep.CommunityEnacted && <Card.Content>
          <img src={enacted} width="36" height="36" />
          <Header>{t('general.enacted')}</Header>
        </Card.Content>}
      </>}
    </Card>
  }
}
