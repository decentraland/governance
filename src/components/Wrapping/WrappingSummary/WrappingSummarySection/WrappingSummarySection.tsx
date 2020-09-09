import React from 'react'
import { Props } from './WrappingSummarySection.types'

import './WrappingSummarySection.css'

export default class WrappingSummarySection extends React.PureComponent<Props> {

  render() {
    return <div className="WrappingSummarySection">
      <div className="WrappingSummaryValue">
        <img src={this.props.icon} width="36" height="36" alt="section" />
        <div>{this.props.label}</div>
      </div>
      {this.props.children}
    </div>
  }
}
