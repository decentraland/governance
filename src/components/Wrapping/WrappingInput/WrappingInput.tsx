import React from 'react'
import { Props, State } from './WrappingInput.types'

import './WrappingInput.css'
import Token from 'components/Token'

const swap = require('../../../images/swap.svg')

export default class WrappingInput extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      value: props.value ?? props.defaultValue
    }
  }

  componentDidUpdate() {
    if (this.props.value !== undefined && this.props.value !== this.state.value) {
      this.setState({ value: this.props.value })
    }
  }

  handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({ value: event.currentTarget.value })
    if (this.props.onChange) {
      this.props.onChange(event)
    }
  }

  render() {
    const { className, ...props } = this.props
    const { value } = this.state
    return <label className={'WrappingInput ' + (className || '')}>
      <div className="WrappingInputMana">
        <Token symbol="MANA" />
        <input type="text" {...props} onChange={this.handleChange} />
      </div>
      <div className="WrappingInputSwap"><img src={swap} width="24" height="24" alt="swap" /></div>
      <div className="WrappingInputVp">
        <Token symbol="VP" value={value as number} size="small" secondary />
      </div>
    </label>
  }
}
