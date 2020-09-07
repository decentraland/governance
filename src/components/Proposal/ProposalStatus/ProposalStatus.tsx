import React from 'react'
import { Props } from './ProposalStatus.types'

import { APP_NAME, CREATOR_NAME } from 'modules/app/types'
import { isVoteEnacted, isVoteExpired, isVotePassed, getVotePercentages, getVoteTimeLeft } from 'modules/vote/utils'
import './ProposalStatus.css'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

const enactedIcon = require('../../../images/check-enacted.svg')
const passedIcon = require('../../../images/check-passed.svg')
const rejectedIcon = require('../../../images/check-rejected.svg')
const timeLeftIcon = require('../../../images/time-left.svg')

export default class ProposalStatus extends React.PureComponent<Props, any> {

  static Badge = (props: { name?: string }) => {
    if (!props.name) {
      return null
    }

    return <div className={'ProposalStatus ' + props.name}>
      <div>{props.name}</div>
    </div>
  }

  static AppName = (props: Props) => {
    const address: keyof typeof APP_NAME = props.vote.appAddress as any
    return <ProposalStatus.Badge name={APP_NAME[address]} />
  }

  static Creator = (props: Props) => {
    const address: keyof typeof CREATOR_NAME = props.vote.creator as any
    return <ProposalStatus.Badge name={CREATOR_NAME[address]} />
  }

  static Approval = (props: Props) => {
    const balance = getVotePercentages(props.vote)
    return <div className="ProposalApproval">
      <span className="ProposalApprovalItem yea">{t('general.yes')} <span>({balance.yeaPct}%)</span></span>
      <span className="ProposalApprovalItem nay">{t('general.no')} <span>({balance.nayPct}%)</span></span>
    </div>
  }

  static Enacted = () => {
    return <div className="ProposalStatus ProposalStatusEnacted">
      <img src={enactedIcon} width="20" height="20" />
      <div>ENACTED</div>
    </div>
  }

  static Passed = () => {
    return <div className="ProposalStatus ProposalStatusPassed">
      <img src={passedIcon} width="20" height="20" />
      <div>PASSED</div>
    </div>
  }

  static Rejected = () => {
    return <div className="ProposalStatus ProposalStatusRejected">
      <img src={rejectedIcon} width="20" height="20" />
      <div>REJECTED</div>
    </div>
  }

  static Progress = (props: Props & { full?: boolean }) => {
    const { yea, nay } = getVotePercentages(props.vote)

    let className = 'ProposalStatusBar'
    if (yea === 0) {
      className += ' EmptyYea'
    }

    if (nay === 0) {
      className += ' EmptyNay'
    }

    if (props.full) {
      className += ' full'
    }

    return <div className="ProposalStatusBarContainer">
      <div className={className}>
        <div className="ProposalStatusBackground" />
        <div className="ProposalStatusYea" style={{ width: yea + '%' }}/>
        <div className="ProposalStatusNay" style={{ width: nay + '%' }}/>
      </div>
      {!props.full && <div className="ProposalStatusDescription">
        {yea}% in favor, {nay}% againts
      </div>}
    </div>
  }

  static ReminderTime = (props: Props) => {
    const timeLeft = getVoteTimeLeft(props.vote)
    if (!timeLeft) {
      return null
    }

    return <div className="ProposalStatus ProposalStatusTime">
      <img src={timeLeftIcon} width="20" height="20" />
      <div>{timeLeft}</div>
    </div>
  }

  static Status = (props: Props) => {
    if (isVoteEnacted(props.vote)) {
      return <ProposalStatus.Enacted />
    }

    if (isVotePassed(props.vote)) {
      return <ProposalStatus.Passed />
    }

    if (isVoteExpired(props.vote)) {
      return <ProposalStatus.Rejected />
    }

    return <ProposalStatus.Progress vote={props.vote} />
  }

  render() {
    const { vote } = this.props
    return <div className="ProposalStatusContainer">
      <ProposalStatus.Status vote={vote} />
      <ProposalStatus.AppName vote={vote} />
      <ProposalStatus.ReminderTime vote={vote} />
    </div>
  }
}
