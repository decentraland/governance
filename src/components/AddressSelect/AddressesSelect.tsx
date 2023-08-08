import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { InputActionMeta, OnChangeValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import classNames from 'classnames'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import useFormatMessage from '../../hooks/useFormatMessage'
import Username from '../User/Username'

import './AddressesSelect.css'

interface UserAddress {
  readonly label: JSX.Element
  readonly value: string
}
interface State {
  readonly inputValue: string
  readonly value: readonly UserAddress[]
  errorKey?: string
}

type Validation = {
  validate: (address: string) => boolean
  errorKey: string
}

const components = {
  DropdownIndicator: null,
}

const createUserAddress = (address: string): UserAddress => ({
  label: <Username address={address} size="tiny" />,
  value: address.toLowerCase(),
})

interface Props {
  maxAddressesAmount: number
  allowLoggedUserAccount?: boolean
  setUsersAddresses: (addresses?: string[]) => void
  isDisabled?: boolean
}

function AddressesSelect({ setUsersAddresses, isDisabled, maxAddressesAmount, allowLoggedUserAccount = false }: Props) {
  const [state, setState] = useState<State>({
    inputValue: '',
    value: [],
  })

  const t = useFormatMessage()

  useEffect(() => {
    if (state.value.length > 0) {
      setUsersAddresses(state.value.map((address) => address.value))
    } else {
      setUsersAddresses(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.value])

  const handleChange = (value: OnChangeValue<UserAddress, true>) => {
    setState((prev) => ({ ...prev, value }))
  }

  const handleInputChange = (inputValue: string, inputAction: InputActionMeta) => {
    const { action } = inputAction
    if (action !== 'menu-close') {
      setState((prev) => ({ ...prev, inputValue, errorKey: undefined }))
    } else if (state.inputValue !== '') {
      addUserAddress(state.inputValue)
    }
  }

  const addUserAddress = (addressList: string) => {
    const addresses = addressList.split(/\s+/g)
    const userAddresses: UserAddress[] = []
    let inputError = ''

    const setError = (errorKey: string, input: string) => {
      inputError = `${inputError}${input} `
      setState((prev) => ({ ...prev, errorKey }))
    }

    const isDuplicate = (address: string): boolean => {
      const addressLower = address.toLowerCase()
      return (
        userAddresses.map((address) => address.value).includes(addressLower) ||
        state.value.map((address) => address.value).includes(addressLower)
      )
    }

    const checkAmount = () => {
      const total = state.value.length + userAddresses.length + 1
      return total <= maxAddressesAmount
    }

    const validations: Validation[] = [
      {
        validate: checkAmount,
        errorKey: 'component.addresses_select.max_error',
      },
      {
        validate: isEthereumAddress,
        errorKey: 'component.addresses_select.error',
      },
      {
        validate: (address) => !isDuplicate(address),
        errorKey: 'component.addresses_select.duplicated_error',
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
        userAddresses.push(createUserAddress(address))
      }
    }

    setState((prev) => ({ ...prev, value: prev.value.concat(userAddresses), inputValue: inputError }))
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const { inputValue } = state
    if (!inputValue) return
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Tab':
        addUserAddress(inputValue)
        event.preventDefault()
    }
  }

  return (
    <div className={classNames('AddressesSelect dcl field', state.errorKey && 'error')}>
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
        placeholder={t('component.addresses_select.placeholder')}
        value={state.value}
        className="AddressesSelect-container"
        classNamePrefix="AddressesSelect"
      />
      <p className="message">
        {t('component.addresses_select.count', { amount: state.value.length, maxAmount: maxAddressesAmount })}
        {!!state.errorKey && ` - ${t(state.errorKey)}`}
      </p>
    </div>
  )
}

export default AddressesSelect
