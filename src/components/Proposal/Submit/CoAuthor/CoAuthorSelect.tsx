/* eslint-disable @typescript-eslint/ban-types */
import React, { Component, KeyboardEventHandler } from 'react'
import { ActionMeta, OnChangeValue, StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import p from 'decentraland-gatsby/dist/components/Text/Paragraph'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import Username from '../../../User/Username'

const components = {
  DropdownIndicator: null,
}

interface CoAuthor {
  readonly label: JSX.Element
  readonly value: string
}

const createCoAuthor = (address: string): CoAuthor => ({
  label: <Username address={address} size="tiny" />,
  value: address,
})

interface State {
  readonly inputValue: string
  readonly value: readonly CoAuthor[]
  error: boolean
}

const colourStyles: StylesConfig<CoAuthor, true> = {
  control: (styles) => ({ ...styles, backgroundColor: 'white' }),
  // option: (styles, { isDisabled, isSelected }) => {
  //   return {
  //     ...styles,
  //     backgroundColor: isDisabled ? undefined : isSelected ? color : undefined,
  //     color: isDisabled ? '#ccc' : isSelected ? 'black' : color,
  //     cursor: isDisabled ? 'not-allowed' : 'default',

  //     ':active': {
  //       ...styles[':active'],
  //       backgroundColor: !isDisabled ? (isSelected ? color : colorSec) : undefined,
  //     },
  //   }
  // },
  // multiValueLabel: (styles) => ({
  //   ...styles,
  //   color: 'rgb(0, 184, 217)',
  // }),
  multiValue: (styles) => {
    return {
      ...styles,
      display: 'flex',
      alignItems: 'center',
      background: 'white',
      border: '1px solid #D8D8D8',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)',
      borderRadius: '4px',
    }
  },
  multiValueRemove: (styles) => ({
    ...styles,
    color: 'var(--dark-gray)',
    ':hover': {
      backgroundColor: 'rgba(var(--dark-gray-rgb), 0.2)',
      borderRadius: '100px',
      height: 'fit-content',
      width: 'fit-content',
      padding: 0,
      margin: '0 4px',
    },
  }),
}

interface Props {
  placeholder: string
}

// extends Component<Props, State>
export default class CoAuthorSelect extends Component<{}, State> {
  state: State = {
    inputValue: '',
    value: [],
    error: false,
  }
  handleChange = (value: OnChangeValue<CoAuthor, true>, actionMeta: ActionMeta<CoAuthor>) => {
    // console.group('Value Changed')
    // console.log(value)
    // console.log(`action: ${actionMeta.action}`)
    // console.groupEnd()
    this.setState({ value })
  }
  handleInputChange = (inputValue: string) => {
    this.setState({ inputValue })
  }
  handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const { inputValue, value } = this.state
    if (!inputValue) return
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Tab':
        // console.group('Value Added')
        // console.log(value)
        // console.groupEnd()
        if (isEthereumAddress(inputValue)) {
          this.setState({
            inputValue: '',
            value: [...value, createCoAuthor(inputValue)],
            error: false,
          })
        } else {
          this.setState({ ...this.state, inputValue: '', error: true })
        }
        event.preventDefault()
    }
  }
  render() {
    const { inputValue, value } = this.state
    return (
      <>
        <div className={TokenList.join(['CoAuthorSelect dcl field', this.state.error && 'error'])}>
          <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={this.handleChange}
            onInputChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            placeholder="Type something and press enter..."
            value={value}
            styles={colourStyles}
          />
          {this.state.error && <p className="message">ERROR</p>}
          {/* migrar a componente funcional y agregar error */}
        </div>
      </>
    )
  }
}
