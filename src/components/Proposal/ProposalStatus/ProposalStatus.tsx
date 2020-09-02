import React from 'react'
// import {HeaderMenu} from 'semantic-ui-react/dist/commonjs/'
// import { Card } from 'decentraland-ui/dist/components/Card/Card'
// import { Page } from 'decentraland-ui/dist/components/Page/Page'
// import { HeaderMenu } from 'decentraland-ui/dist/components/HeaderMenu/HeaderMenu'
// import { Header } from 'decentraland-ui/dist/components/Header/Header'
// import { Button } from 'decentraland-ui/dist/components/Button/Button'
// import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './ProposalStatus.types'
// import Navbar from 'components/Navbar/Navbar'
// import Footer from 'components/Footer/Footer'
// import { Navigation } from 'components/Navigation'
// import { NavigationTab } from 'components/Navigation/Navigation.types'
// import { t } from 'decentraland-dapps/dist/modules/translation/utils'

import './ProposalStatus.css'
import { APP_NAME, APP_DELAY } from 'modules/app/types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

const enactedIcon = require('../../../images/check-enacted.svg')
const passedIcon = require('../../../images/check-passed.svg')
const rejectedIcon = require('../../../images/check-rejected.svg')
const timeLeftIcon = require('../../../images/time-left.svg')

const Second = 1000
const Minute = Second * 60
const Hour = Minute * 60
const Day = Hour * 14

export default class ProposalStatus extends React.PureComponent<Props, any> {

  wasEnacted() {
    return this.props.vote.executed
  }

  renderEnacted() {
    return <div className="ProposalStatus ProposalStatusEnacted">
      <img src={enactedIcon} width="20" height="20" />
      <div>ENACTED</div>
    </div>
  }

  getQuorumRequired() {
    const { vote } = this.props
    const acceptQuorumPct = Number(vote.minAcceptQuorum) / 10e18
    const votingPower = Number(vote.votingPower)
    return votingPower * acceptQuorumPct
  }

  getSupportRequired() {
    const { vote } = this.props
    const supportRequiredPct = Number(vote.supportRequiredPct) / 10e18
    const yea = Number(vote.yea)
    const nay = Number(vote.nay)
    return (yea + nay) * supportRequiredPct
  }

  getPercentages() {
    const { vote } = this.props
    const minAcceptQuorumPct = Number(vote.minAcceptQuorum) / 10e18
    const votingPower = Number(vote.votingPower)
    const yea = Number(vote.yea)
    const nay = Number(vote.nay)

    const quorumRequired = votingPower * minAcceptQuorumPct
    const quorumTotal = yea + nay
    let yeaSize = 0
    let naySize = 0

    if (quorumTotal < quorumRequired) {
      yeaSize = Math.floor((yea / quorumRequired) * 100)
      naySize = Math.floor((nay / quorumRequired) * 100)
    } else {
      yeaSize = yea === 0 ? 0 : nay === 0 ? 100 : Math.ceil((yea / quorumTotal) * 100)
      naySize = nay === 0 ? 0 : 100 - yeaSize
    }

    return {
      yea: yeaSize,
      nay: naySize
    }
  }

  getExpiration() {
    const { vote } = this.props
    const appAddress: keyof typeof APP_DELAY = vote.appAddress as any
    const votingTime = APP_DELAY[appAddress] || APP_DELAY.DEFAULT
    return Number(this.props.vote.startDate) + votingTime
  }

  wasPassed() {
    const { vote } = this.props
    const minAcceptQuorumPct = Number(vote.minAcceptQuorum) / 10e18
    const supportRequiredPct = Number(vote.supportRequiredPct) / 10e18
    const votingPower = Number(vote.votingPower)
    const yea = Number(vote.yea)
    const nay = Number(vote.nay)

    const quorumRequired = votingPower * minAcceptQuorumPct
    const supportRequired = (yea + nay) * supportRequiredPct

    if (yea < quorumRequired) {
      return false
    }

    if (yea < supportRequired) {
      return false
    }

    return true
  }

  renderPassed() {
    return <div className="ProposalStatus ProposalStatusPassed">
      <img src={passedIcon} width="20" height="20" />
      <div>PASSED</div>
    </div>
  }

  wasRejected() {
    const expiration = this.getExpiration()
    return Date.now() > expiration
  }

  renderRejected() {
    return <div className="ProposalStatus ProposalStatusRejected">
      <img src={rejectedIcon} width="20" height="20" />
      <div>REJECTED</div>
    </div>
  }

  renderProgress() {
    const { yea, nay } = this.getPercentages()

    let className = 'ProposalStatusBar'
    if (yea === 0) {
      className += ' EmptyYea'
    }

    if (nay === 0) {
      className += ' EmptyNay'
    }

    return <div className="ProposalStatusBarContainer">
      <div className={className}>
        <div className="ProposalStatusBackground" />
        <div className="ProposalStatusYea" style={{ width: yea + 'px' }}/>
        <div className="ProposalStatusNay" style={{ width: nay + 'px' }}/>
      </div>
      <div className="ProposalStatusDescription">
        {yea}% in favor, {nay}% againts
      </div>
    </div>
  }

  renderStatus() {
    if (this.wasEnacted()) {
      return this.renderEnacted()
    }

    if (this.wasPassed()) {
      return this.renderPassed()
    }

    if (this.wasRejected()) {
      return this.renderRejected()
    }

    return this.renderProgress()
  }

  renderApp() {
    const { vote } = this.props
    const appAddress: keyof typeof APP_NAME = vote.appAddress as any
    return <div className="ProposalStatus">
      <div>{APP_NAME[appAddress] || appAddress}</div>
    </div>
  }

  renderReminderTime() {
    const expiration = this.getExpiration()
    const now = Date.now()
    const { vote } = this.props
    const diff = Number(vote.startDate) + expiration - now

    if (diff <= 0) {
      return null
    }

    const days = Math.floor(diff / Day)
    const hours = Math.floor((diff % Day) / Hour)
    const minutes = Math.floor((diff % Hour) / Minute)
    const seconds = Math.floor((diff & Minute) / Second)
    const values = { days, hours, minutes, seconds }
    let key = 'proposal.'
    if (days > 0) {
      key += 'days_left'
    } else if (hours > 0) {
      key += 'hours_left'
    } else if (minutes > 0) {
      key += 'minutes_left'
    } else {
      key += 'seconds_left'
    }

    return <div className="ProposalStatus ProposalStatusTime">
      <img src={timeLeftIcon} width="20" height="20" />
      <div>{t(key, values)}</div>
    </div>
  }

  render() {
    return <div className="ProposalStatusContainer">
      {this.renderStatus()}
      {this.renderApp()}
      {this.renderReminderTime()}
    </div>
  }
}
