import React, { useEffect, useRef, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import { useSearchParams } from '../../hooks/useSearchParams'
import locations from '../../modules/locations'

import './SearchInput.css'

export function handleSearch(textSearch: string, location: Location) {
  const newParams = new URLSearchParams(location.search)
  if (textSearch) {
    newParams.set('search', textSearch)
    newParams.delete('page')
    newParams.delete('order')
  } else {
    newParams.delete('search')
    newParams.delete('page')
  }

  navigate(locations.proposals(newParams))
}

export default function SearchInput(props: React.HTMLAttributes<HTMLDivElement>) {
  const t = useFormatMessage()
  const location = useLocation()
  const { search } = useSearchParams()
  const searchInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState(() => search || '')

  function focusSearch() {
    searchInput.current?.focus()
  }

  useEffect(() => {
    if (!search) {
      setSearchText('')
      setOpen(false)
    } else {
      focusSearch()
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

  const keyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Escape') {
      setSearchText('')
    }
  }

  return (
    <div className={'SearchContainer'}>
      <input
        {...props}
        className={TokenList.join(['SearchInput', open && 'SearchInput--open', props.className])}
        value={searchText}
        placeholder={props.placeholder || t('navigation.search.placeholder') || ''}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onKeyUp={keyUpHandler}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(!!searchText)}
        ref={searchInput}
      />
      {searchText && open && <Close small onClick={handleClear} />}
    </div>
  )
}
