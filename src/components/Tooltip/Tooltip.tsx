import React from 'react'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'
import './Tooltip.css'

const tooltip = require('../../images/tooltip.svg')

export default class Tooltip extends React.PureComponent<PopupProps> {
  render() {
    return <Popup trigger={<img src={tooltip} width="16" height="16" alt="i" className="tooltip" />} {...this.props} className={'Tooltip ' + (this.props.className || '')} />
  }
}
