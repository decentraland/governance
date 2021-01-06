import React from 'react'
import { Props } from './ProposalStatus.types'

import { getDelayTimeLeft, getVoteTimeLeft, isProposalExecutable, isVoteExpired } from 'modules/proposal/utils'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAppName } from 'modules/app/utils'
import { ProposalStatus as Status, ProposalType } from 'modules/proposal/types'
import Token from 'components/Token'
import './ProposalStatus.css'

const enactedIcon = require('../../../images/check-enacted.svg')
const passedIcon = require('../../../images/check-passed.svg')
const rejectedIcon = require('../../../images/check-rejected.svg')
const timeLeftIcon = require('../../../images/time-left.svg')

export default class ProposalStatus extends React.PureComponent<Props, any> {

  static Badge = (props: { name?: string }) => {
    if (!props.name) {
      return null
    }

    return <div className={'ProposalStatus ' + props.name.replace(/\W+/, '-').toLowerCase()}>
      <div>{props.name}</div>
    </div>
  }

  static AppName = (props: { address?: string }) => {
    const name = getAppName(props.address)
    if (!name) {
      return null
    }

    return <ProposalStatus.Badge name={name} />
  }

  static Approval = (props: Props) => {
    if (props.proposal.proposalType !== ProposalType.Vote) {
      return null
    }

    const balance = props.proposal.balance
    return <div className="ProposalApproval">
      <div className="ProposalApprovalItem yea">
        <span>{t('general.yes')}</span>
        <span className="secondary">
          {balance.yeaPercentage}
          {'% ('}
          <Token secondary size="small" symbol="VP" value={balance.yea} />
          {')'}
        </span>
      </div>
      <div className="ProposalApprovalItem nay">
        <span>{t('general.no')}</span>
        <span className="secondary">
          {balance.nayPercentage}
          {'% ('}
          <Token secondary size="small" symbol="VP" value={balance.nay} />
          {')'}
        </span>
      </div>
    </div>
  }

  static Enacted = () => {
    return <div className="ProposalStatus ProposalStatusEnacted">
      <img src={enactedIcon} width="20" height="20" alt="enacted" />
      <div>{t('general.enacted')}</div>
    </div>
  }

  static Passed = () => {
    return <div className="ProposalStatus ProposalStatusPassed">
      <img src={passedIcon} width="20" height="20" alt="passed"/>
      <div>{t('general.passed')}</div>
    </div>
  }

  static Rejected = () => {
    return <div className="ProposalStatus ProposalStatusRejected">
      <img src={rejectedIcon} width="20" height="20" alt="rejected"/>
      <div>{t('general.rejected')}</div>
    </div>
  }

  static Progress = (props: Props & { full?: boolean }) => {
    if (props.proposal.proposalType !== ProposalType.Vote) {
      return null
    }

    const { yeaPercentage, nayPercentage } = props.proposal.balance

    let className = 'ProposalStatusBar'
    if (yeaPercentage === 0) {
      className += ' EmptyYea'
    }

    if (nayPercentage === 0) {
      className += ' EmptyNay'
    }

    if (props.full) {
      className += ' full'
    }

    let yeaWidth = yeaPercentage
    let nayWidth = nayPercentage

    if (!props.full && yeaPercentage > 0 && nayPercentage > 0) {
      yeaWidth = Math.min(Math.max(yeaPercentage, 5), 95)
      nayWidth = Math.min(Math.max(nayPercentage, 5), 95)
    }

    return <div className="ProposalStatusBarContainer">
      <div className={className}>
        <div className="ProposalStatusBackground" />
        <div className="ProposalStatusYea" style={{ width: yeaWidth + '%' }}/>
        <div className="ProposalStatusNay" style={{ width: nayWidth + '%' }}/>
      </div>
      {!props.full && <div className="ProposalStatusDescription">
        {t('proposal.percentages', { yea: yeaPercentage, nay: nayPercentage })}
      </div>}
    </div>
  }

  static ReminderTime = (props: Props) => {
    if (props.proposal.proposalType === ProposalType.Vote) {
      if (props.proposal.executed) {
        return null
      }

      const timeLeft = getVoteTimeLeft(props.proposal)
      if (!timeLeft) {
        return null
      }

      return <div className="ProposalStatus ProposalStatusTime">
        <img src={timeLeftIcon} width="20" height="20" alt="time" />
        <div>{timeLeft}</div>
      </div>
    }

    if (props.proposal.proposalType === ProposalType.DelayScript) {
      if (props.proposal.pausedAt) {
        return <ProposalStatus.Badge name="paused" />
      }

      if ((props.proposal.executionTime * 1000) < Date.now()) {
        return <div className="ProposalStatus ProposalStatusTime">
          <div>ready to execute</div>
        </div>
      }

      const timeLeft = getDelayTimeLeft(props.proposal)
      if (!timeLeft) {
        return null
      }

      return <div className="ProposalStatus ProposalStatusTime">
        <img src={timeLeftIcon} width="20" height="20" alt="time" />
        <div>{timeLeft}</div>
      </div>
    }

    return null
  }

  static Status = (props: Props) => {
    if (props.proposal.proposalType !== ProposalType.Vote) {
      return null
    }

    const expired = isVoteExpired(props.proposal)
    const executable = isProposalExecutable(props.proposal)
    if (props.proposal.status === Status.Passed && (executable || expired)) {
      return <ProposalStatus.Passed />
    }

    switch (props.proposal.status) {
      case Status.Enacted:
        return <ProposalStatus.Enacted />
      case Status.Rejected:
        return <ProposalStatus.Rejected />
      default:
        return <ProposalStatus.Progress proposal={props.proposal} />
    }
  }

  render() {
    const { proposal } = this.props
    const identifier = proposal.identifier
    return <div className="ProposalStatusContainer">
      <ProposalStatus.Status proposal={proposal} />
      <ProposalStatus.AppName address={identifier.appAddress} />
      <ProposalStatus.ReminderTime proposal={proposal} />
    </div>
  }
}
