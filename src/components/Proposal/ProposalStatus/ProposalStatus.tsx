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
import { env } from 'decentraland-commons'

const VOTING_TIME = Number(env.get('REACT_APP_VOTING_TIME', '0'))
const enactedCheck = require('../../../images/check-enacted.svg')
const passedCheck = require('../../../images/check-passed.svg')
const rejectedCheck = require('../../../images/check-rejected.svg')

export default class ProposalStatus extends React.PureComponent<Props, any> {

  wasEnacted() {
    return this.props.vote.executed
  }

  renderEnacted() {
    return <div className="ProposalStatus ProposalStatusEnacted">
      <img src={enactedCheck} width="20" height="20" />
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
      <img src={passedCheck} width="20" height="20" />
      <div>PASSED</div>
    </div>
  }

  wasRejected() {
    const expiredTime = Number(this.props.vote.startDate) + VOTING_TIME

    return Date.now() > expiredTime
  }

  renderRejected() {
    return <div className="ProposalStatus ProposalStatusRejected">
      <img src={rejectedCheck} width="20" height="20" />
      <div>REJECTED</div>
    </div>
  }

  renderStatus() {
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

  render() {
    if (this.wasEnacted()) {
      return this.renderEnacted()
    }

    if (this.wasPassed()) {
      return this.renderPassed()
    }

    if (this.wasRejected()) {
      return this.renderRejected()
    }

    return this.renderStatus()
  }
}
