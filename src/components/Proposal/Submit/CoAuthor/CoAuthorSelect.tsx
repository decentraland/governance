import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { OnChangeValue, components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import Username from '../../../User/Username'

import './CoAuthorSelect.css'
import { CoAuthorProps } from './CoAuthors'

interface CoAuthor {
  readonly label: JSX.Element
  readonly value: string
}
interface State {
  readonly inputValue: string
  readonly value: readonly CoAuthor[]
  error: boolean
}

const comp = {
  DropdownIndicator: null,
  Input: (props: any) => <components.Input {...props} onPaste={() => console.log('ON PASTE')} />,
}

const createCoAuthor = (address: string): CoAuthor => ({
  label: <Username address={address} size="tiny" />,
  value: address.toLowerCase(),
})

function CoAuthorSelect({ setCoAuthors }: CoAuthorProps) {
  const [state, setState] = useState<State>({
    inputValue: '',
    value: [],
    error: false,
  })

  const t = useFormatMessage()
  const [account] = useAuthContext()

  useEffect(() => {
    if (state.value.length > 0) {
      setCoAuthors(state.value.map((address) => address.value))
    } else {
      setCoAuthors(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value])

  const isDuplicate = (address: string): boolean => {
    const addressLower = address.toLowerCase()
    return account?.toLowerCase() === addressLower || state.value.map((address) => address.value).includes(addressLower)
  }

  const handleChange = (value: OnChangeValue<CoAuthor, true>) => {
    setState((prev) => ({ ...prev, value }))
  }

  const handleInputChange = (inputValue: string) => {
    setState((prev) => ({ ...prev, inputValue, error: false }))
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const { inputValue, value } = state
    if (!inputValue) return
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Tab':
        if (isEthereumAddress(inputValue)) {
          const baseState = {
            inputValue: '',
            error: false,
          }
          if (!isDuplicate(inputValue)) {
            setState({
              ...baseState,
              value: [...value, createCoAuthor(inputValue)],
            })
          } else {
            setState({
              ...baseState,
              value,
            })
          }
        } else {
          setState((prev) => ({ ...prev, inputValue: '', error: true }))
        }
        event.preventDefault()
    }
  }

  return (
    <div className={TokenList.join(['CoAuthorSelect dcl field', state.error && 'error'])}>
      <CreatableSelect
        components={comp}
        inputValue={state.inputValue}
        isClearable
        isMulti
        menuIsOpen={false}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t('page.submit.co_author_placeholder')}
        value={state.value}
        className="CoAuthorSelect-container"
        classNamePrefix="CoAuthorSelect"
      />
      <p className="message">
        {t('page.submit.co_author_count', { amount: state.value.length, s: state.value.length != 1 ? 's' : '' })}
        {state.error && ` - ${t('page.submit.co_author_error')}`}
      </p>
    </div>
  )
}

export default CoAuthorSelect
