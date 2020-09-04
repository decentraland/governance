import React from 'react'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Mana } from 'decentraland-ui/dist/components/Mana/Mana'
import { Props } from './Token.types'
import VotingPower from './VotingPower'

import './Token.css'

export default class Token extends React.PureComponent<Props> {
  render() {
    const { size, secondary } = this.props
    const value = this.props.value || 0

    switch (this.props.symbol) {
      case 'MANA':
        return <Mana size={size} className={secondary && 'secondary' || ''}>{t('general.number', { value })}</Mana>
        
      case 'VP':
        return <VotingPower size={size} secondary={secondary} value={value} />

      default:
        return t('general.number', { value })
    }
  }
}
