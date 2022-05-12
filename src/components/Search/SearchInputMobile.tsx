import React, { useEffect, useRef, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import { useBurgerMenu } from '../../hooks/useBurgerMenu'
import { useSearchParams } from '../../hooks/useSearchParams'

import { handleSearch } from './SearchInput'
import './SearchInputMobile.css'

export default function SearchInputMobile(props: React.HTMLAttributes<HTMLDivElement>) {
  const t = useFormatMessage()
  const location = useLocation()
  const { search, searching } = useSearchParams()
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
        className={TokenList.join(['SearchInputMobile', open && 'SearchInputMobile--open', props.className])}
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
