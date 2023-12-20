import { KeyboardEventHandler, useEffect, useState } from 'react'
import { InputActionMeta, OnChangeValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import useFormatMessage from '../../hooks/useFormatMessage'
import Username from '../Common/Username'

import './AddressesSelect.css'

const DEFAULT_MAX_ADDRESSES_AMOUNT = 20

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
  label: <Username address={address} size="xs" />,
  value: address.toLowerCase(),
})

interface Props {
  setUsersAddresses: (addresses?: string[]) => void
  maxAddressesAmount?: number
  loggedUserIsInvalid?: boolean
  isDisabled?: boolean
  addressAlias?: string
  addressesAlias?: string
  loggedUserInvalidKey?: string
}

function AddressesSelect({
  setUsersAddresses,
  isDisabled,
  maxAddressesAmount = DEFAULT_MAX_ADDRESSES_AMOUNT,
  loggedUserIsInvalid,
  addressAlias = 'address',
  addressesAlias = 'addresses',
  loggedUserInvalidKey,
}: Props) {
  const [state, setState] = useState<State>({
    inputValue: '',
    value: [],
  })

  const t = useFormatMessage()
  const [account] = useAuthContext()

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

    const maxCount = () => {
      const total = state.value.length + userAddresses.length + 1
      return total <= maxAddressesAmount
    }

    const isAuthor = (address: string): boolean => !!account && account.toLowerCase() === address.toLowerCase()

    const validations: Validation[] = [
      {
        validate: maxCount,
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
      {
        validate: (address) => (loggedUserIsInvalid ? !isAuthor(address) : true),
        errorKey: loggedUserInvalidKey || 'component.addresses_select.logged_user_invalid',
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
        {t('component.addresses_select.count', {
          amount: state.value.length,
          maxAmount: maxAddressesAmount,
          addressesAlias,
        })}
        {!!state.errorKey && ` - ${t(state.errorKey, { addressAlias, addressesAlias })}`}
      </p>
    </div>
  )
}

export default AddressesSelect
