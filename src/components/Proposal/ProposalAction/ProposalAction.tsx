import React from 'react'
import { Props } from './ProposalAction.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { ProposalStatus } from 'modules/proposal/types'
import { isProposalExecutable, isVoteExpired } from 'modules/proposal/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Tooltip from 'components/Tooltip'
import './ProposalAction.css'

export default class ProposalAction extends React.PureComponent<Props> {

  handleApprove = (event: React.MouseEvent<any>) => {
    if (this.props.onClickApprove) {
      this.props.onClickApprove(event, this.props.vote)
    }
  }

  handleReject = (event: React.MouseEvent<any>) => {
    if (this.props.onClickReject) {
      this.props.onClickReject(event, this.props.vote)
    }
  }

  handleEnact = (event: React.MouseEvent<any>) => {
    if (this.props.onClickEnact) {
      this.props.onClickEnact(event, this.props.vote)
    }
  }

  renderVotingPowerTooltip() {
    const vote = this.props.vote
    const balance = this.props.balance || 0
    const startDate = new Date(Number(vote.startDate + '000'))
    const snapshotBlock = vote.snapshotBlock

    return <Tooltip
      position="bottom center"
      content={t('proposal_detail_page.voting_power_detail', { snapshotBlock, startDate })}
      trigger={<Header sub>
        {t('proposal_detail_page.voting_power', { vp: balance })}
        <Tooltip.Icon />
      </Header>}
    />
  }

  renderEnactedTooltip() {
    return <Tooltip
      position="bottom center"
      content={t('proposal_detail_page.enact_detail')}
      trigger={<Header sub>
        {t('proposal_detail_page.enact_tooltip')}
        <Tooltip.Icon />
      </Header>}
    />
  }

  render() {
    const vote = this.props.vote
    const { isLoading, casts, cast, balance } = this.props
    const loading = isLoading || !casts || balance === undefined
    const expired = isVoteExpired(vote)
    const passed = vote.status === ProposalStatus.Passed
    const enacted = vote.status === ProposalStatus.Enacted
    const disabled = enacted || expired || balance === 0
    const executable = isProposalExecutable(vote)

    if (loading) {
      return <div className="ProposalAction">
        <div>
          <Button inverted loading className="pending">loading</Button>
        </div>
        <div />
      </div>
    }

    if (passed && executable) {
      return <div className="ProposalAction">
        <div>
          <Button primary onClick={this.handleEnact}>{t('proposal_detail_page.enact')}</Button>
        </div>
        <div>{this.renderEnactedTooltip()}</div>
      </div>
    }

    if (!cast) {
      return <div className="ProposalAction">
        <div className="pending">
          <Button inverted disabled={disabled} className="pending" onClick={this.handleApprove}>
            {t('proposal_detail_page.vote_yes')}
          </Button>
          <Button inverted disabled={disabled} className="pending" onClick={this.handleReject}>
            {t('proposal_detail_page.vote_no')}
          </Button>
        </div>
        <div>{this.renderVotingPowerTooltip()}</div>
      </div>
    }

    if (!cast.supports) {
      return <div className="ProposalAction">
        <div className={'voted' + (disabled ? '' : ' enabled')}>
          <Button inverted disabled={disabled} className="nay current">
            {t('proposal_detail_page.voted_no')}
          </Button>
          <Button inverted disabled={disabled} className="yea switch" onClick={this.handleApprove}>
            {t('proposal_detail_page.switch_vote_yes')}
          </Button>
        </div>
        <div>{this.renderVotingPowerTooltip()}</div>
      </div>
    }

    return <div className="ProposalAction">
      <div className={'voted' + (disabled ? '' : ' enabled')}>
        <Button inverted disabled={disabled} className="yea current">
          {t('proposal_detail_page.voted_yes')}
        </Button>
        <Button inverted disabled={disabled} className="nay switch" onClick={this.handleReject}>
          {t('proposal_detail_page.switch_vote_no')}
        </Button>
      </div>
      <div>{this.renderVotingPowerTooltip()}</div>
    </div>
  }
}
