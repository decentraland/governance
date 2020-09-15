import React from 'react'
import { Popup, PopupProps } from 'decentraland-ui/dist/components/Popup/Popup'
import './Tooltip.css'

const tooltip = require('../../images/tooltip.svg')

export default class Tooltip extends React.PureComponent<PopupProps> {

  static Icon() {
    return <img src={tooltip} width="16" height="16" alt="i" className="tooltip" />
  }

  render() {
    return <Popup trigger={<Tooltip.Icon />} {...this.props} className={'Tooltip ' + (this.props.className || '')} />
  }
}
