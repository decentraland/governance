import React from 'react'
import './VotingPower.css'
import { Props } from './VotingPower.types'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'

const votingPowerIcon = require('../../../images/vp.svg')
const votingPowerSecondaryIcon = require('../../../images/vp-secondary.svg')

export default class VotingPower extends React.PureComponent<Props> {
  render() {
    const value = this.props.value || 100_000
    const src = this.props.secondary ? votingPowerSecondaryIcon : votingPowerIcon
    let className = 'VotingPower ' + (this.props.size || 'small')

    if (this.props.secondary) {
      className += ' secondary'
    }

    return <div className={className}>
      <div>{t('general.voting_power', { value })}</div>
      <img src={src} width="43" height="29" />
    </div>
  }
}
