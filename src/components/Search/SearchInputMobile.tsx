import { useEffect, useRef, useState } from 'react'

import { useLocation } from '@reach/router'
import classNames from 'classnames'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import { useBurgerMenu } from '../../hooks/useBurgerMenu'
import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'

import { handleSearch } from './SearchInput'
import './SearchInputMobile.css'

export default function SearchInputMobile(props: React.HTMLAttributes<HTMLDivElement>) {
  const t = useFormatMessage()
  const location = useLocation()
  const { search, searching } = useProposalsSearchParams()
  const searchInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState(() => search || '')
  const [placeholder, setPlaceholder] = useState(t('navigation.search.mobile.placeholder') || '')
  const burgerMenu = useBurgerMenu()
  useEffect(() => {
    burgerMenu?.setStatus((prev) => ({ ...prev, searching: searching }))
  }, [searching])

  function focusSearch() {
    searchInput.current?.focus()
  }

  useEffect(() => {
    if (!search) {
      setSearchText('')
    } else {
      setSearchText(search)
      setOpen(true)
    }
  }, [search])

  function handleChange(e: React.ChangeEvent<any>) {
    setSearchText(e.target.value)
  }

  function handleClear() {
    setSearchText('')
    focusSearch()
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch(searchText, location)
    }
  }

  function handleFocus() {
    setOpen(true)
    if (!searchText) setPlaceholder(t('navigation.search.mobile.focus_placeholder') || '')
  }

  function handleBlur() {
    setOpen(!!searchText)
    if (!searchText) setPlaceholder(t('navigation.search.mobile.placeholder') || '')
  }

  return (
    <div className={'SearchContainerMobile'}>
      <input
        {...props}
        className={classNames('SearchInputMobile', open && 'SearchInputMobile--open', props.className)}
        value={searchText}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={searchInput}
      />
      {searchText && open && <Close small onClick={handleClear} />}
    </div>
  )
}
