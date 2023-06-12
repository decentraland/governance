import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { InputActionMeta, OnChangeValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import Username from '../../../User/Username'

import './CoAuthorSelect.css'
import { CoAuthorProps } from './CoAuthors'

const MAX_COAUTHORS_AMOUNT = 5

interface CoAuthor {
  readonly label: JSX.Element
  readonly value: string
}
interface State {
  readonly inputValue: string
  readonly value: readonly CoAuthor[]
  errorKey?: string
}

type Validation = {
  validate: (address: string) => boolean
  errorKey: string
}

const components = {
  DropdownIndicator: null,
}

const createCoAuthor = (address: string): CoAuthor => ({
  label: <Username address={address} size="tiny" />,
  value: address.toLowerCase(),
})

function CoAuthorSelect({ setCoAuthors, isDisabled }: CoAuthorProps) {
  const [state, setState] = useState<State>({
    inputValue: '',
    value: [],
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

  const isAuthor = (address: string): boolean => account?.toLowerCase() === address.toLowerCase()

  const handleChange = (value: OnChangeValue<CoAuthor, true>) => {
    setState((prev) => ({ ...prev, value }))
  }

  const handleInputChange = (inputValue: string, inputAction: InputActionMeta) => {
    const { action } = inputAction
    if (action !== 'menu-close') {
      setState((prev) => ({ ...prev, inputValue, errorKey: undefined }))
    } else if (state.inputValue !== '') {
      addCoauthors(state.inputValue)
    }
  }

  const addCoauthors = (addressList: string) => {
    const addresses = addressList.split(/\s+/g)
    const coauthors: CoAuthor[] = []
    let inputError = ''

    const setError = (errorKey: string, input: string) => {
      inputError = `${inputError}${input} `
      setState((prev) => ({ ...prev, errorKey }))
    }

    const isDuplicate = (address: string): boolean => {
      const addressLower = address.toLowerCase()
      return (
        coauthors.map((address) => address.value).includes(addressLower) ||
        state.value.map((address) => address.value).includes(addressLower)
      )
    }

    const checkAmount = () => {
      const total = state.value.length + coauthors.length + 1
      return total <= MAX_COAUTHORS_AMOUNT
    }

    const validations: Validation[] = [
      {
        validate: checkAmount,
        errorKey: 'page.submit.co_author_max_error',
      },
      {
        validate: isEthereumAddress,
        errorKey: 'page.submit.co_author_error',
      },
      {
        validate: (address) => !isDuplicate(address),
        errorKey: 'page.submit.co_author_duplicated_error',
      },
      {
        validate: (address) => !isAuthor(address),
        errorKey: 'page.submit.co_author_as_author_error',
      },
    ]

    let error = false
    for (const address of addresses) {
      error = false
      for (const validation of validations) {
        if (!validation.validate(address)) {
          error = true
          setError(validation.errorKey, address)
          break
        }
      }

      if (!error) {
        coauthors.push(createCoAuthor(address))
      }
    }

    setState((prev) => ({ ...prev, value: prev.value.concat(coauthors), inputValue: inputError }))
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const { inputValue } = state
    if (!inputValue) return
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Tab':
        addCoauthors(inputValue)
        event.preventDefault()
    }
  }

  return (
    <div className={classNames('CoAuthorSelect dcl field', state.errorKey && 'error')}>
      <CreatableSelect
        components={components}
        inputValue={state.inputValue}
        isDisabled={isDisabled}
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
        {t('page.submit.co_author_count', { amount: state.value.length, maxAmount: MAX_COAUTHORS_AMOUNT })}
        {!!state.errorKey && ` - ${t(state.errorKey)}`}
      </p>
    </div>
  )
}

export default CoAuthorSelect
