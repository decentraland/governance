import { useEffect, useRef, useState } from 'react'

import { useLocation } from '@reach/router'
import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import { useProposalsSearchParams } from '../../hooks/useProposalsSearchParams'
import locations, { navigate } from '../../utils/locations'
import Cross from '../Icon/Cross'

import './SearchInputMobile.css'

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

export default function SearchInputMobile() {
  const t = useFormatMessage()
  const location = useLocation()
  const { search } = useProposalsSearchParams()
  const searchInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState(() => search || '')

  const focusSearch = () => {
    searchInput.current?.focus()
    searchInput.current?.click()
  }

  useEffect(() => {
    if (!search) {
      setSearchText('')
      setOpen(false)
    } else {
      focusSearch()
    }
  }, [search])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const handleClear = () => {
    if (searchText === '') {
      setOpen(false)
    } else {
      setSearchText('')
      focusSearch()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    <div className={classNames('SearchInputMobile', open && 'SearchInputMobile--open')}>
      <div className="SearchInputMobile__Container">
        <div className="SearchInputMobile__Gradient" />
        <input
          className={classNames('SearchInputMobile__Input', open && 'SearchInputMobile__Input--open')}
          value={searchText}
          placeholder={t('navigation.search.placeholder') || ''}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onKeyUp={keyUpHandler}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(!!searchText)}
          ref={searchInput}
        />
        {open && (
          <Cross className="SearchInputMobile__CloseIcon" size="14" color="var(--black-800)" onClick={handleClear} />
        )}
      </div>
      <div className={classNames('SearchInputMobile__Overlay', open && 'SearchInputMobile__Overlay--open')} />
    </div>
  )
}
