import { useEffect, useRef, useState } from 'react'

import { useLocation } from '@reach/router'
import classNames from 'classnames'
import { Close } from 'decentraland-ui/dist/components/Close/Close'

import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'
import locations, { navigate } from '../../utils/locations'

import './SearchInput.css'

function handleSearch(textSearch: string, location: Location) {
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

export default function SearchInput() {
  const t = useFormatMessage()
  const location = useLocation()
  const { search } = useProposalsSearchParams()
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
    <div className="SearchContainer">
      <input
        className={classNames('SearchInput', open && 'SearchInput--open')}
        value={searchText}
        placeholder={t('navigation.search.placeholder') || ''}
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
