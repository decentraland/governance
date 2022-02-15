import React, { useContext, useState, useEffect } from 'react'
import { BurgerMenuStatusContext } from '../Context/BurgerMenuStatusContext'
import SearchInputMobile from '../Search/SearchInputMobile'
import CategoryList from '../Category/CategoryList'
import StatusFilter from '../Search/StatusFilter'
import TimeFrameFilter from '../Search/TimeFrameFilter'
import MobileNavigation from './MobileNavigation'
import CategoryFilter from '../Search/CategoryFilter'
import './BurgerMenuContent.css'

export type FilterStatus = {
  categoryOpen: boolean
  statusOpen: boolean
  timeFrameOpen: boolean
}

export type BurgerMenuContentProps = {
  navigationOnly?: boolean
}

const filtersInitialStatus = { categoryOpen: true, statusOpen: false, timeFrameOpen: false }

const OPEN_BURGER_HEIGHT = 584
const SEARCH_TITLE_HEIGHT = 32
const CATEGORY_FILTER_HEIGHT = 368
const STATUS_FILTER_HEIGHT = 290
const TIMEFRAME_FILTER_HEIGHT = 212
const CLOSED_FILTER_HEIGHT = 56
const MOBILE_NAVIGATION_HEIGHT = 104

function BurgerMenuContent({ navigationOnly }: BurgerMenuContentProps) {
  const [footer, setFooter] = useState<Element | null>(null)
  const burgerMenu = useContext(BurgerMenuStatusContext)
  const [filterStatus, setFilterStatus] = useState(filtersInitialStatus)
  const [burgerOpen, burgerSearching, burgerFiltering, burgerTranslate] = [
    burgerMenu?.status.open,
    burgerMenu?.status.searching,
    burgerMenu?.status.filtering,
    burgerMenu?.status.translate,
  ]

  useEffect(() => {
    setFooter(document.querySelectorAll('.dcl.footer')[0])
    return () => {
      if (footer) {
        footer.setAttribute('style', '')
      }
    }
  }, [])

  useEffect(() => {
    if (footer) {
      footer.classList.add('Animated')
      if (!!burgerTranslate) {
        footer.setAttribute('style', `transform: translateY(${burgerTranslate})`)
      } else {
        footer.setAttribute('style', '')
      }
    }
  }, [footer, burgerTranslate])

  function handleFilterStatusChange(status: FilterStatus) {
    setFilterStatus(status)
  }

  useEffect(() => {
    if (!burgerOpen || !burgerFiltering || !burgerSearching) {
      setFilterStatus(filtersInitialStatus)
    }
  }, [burgerOpen, burgerFiltering, burgerSearching])

  useEffect(() => {
    let filtersHeight =
      (filterStatus.categoryOpen ? CATEGORY_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT) +
      (filterStatus.statusOpen ? STATUS_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT) +
      (filterStatus.timeFrameOpen ? TIMEFRAME_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT)

    let translate
    if (!!navigationOnly) {
      translate = MOBILE_NAVIGATION_HEIGHT + SEARCH_TITLE_HEIGHT + 'px'
    } else {
      if (!burgerOpen) {
        translate = undefined
      } else {
        translate =
          (burgerSearching ? (burgerFiltering ? filtersHeight : SEARCH_TITLE_HEIGHT) : OPEN_BURGER_HEIGHT) + 'px'
      }
    }
    burgerMenu?.setStatus({ ...burgerMenu?.status, translate: translate })
  }, [burgerOpen, burgerSearching, burgerFiltering, filterStatus, navigationOnly])

  return (
    <div
      className="BurgerMenuContent Animated"
      style={(!burgerMenu?.status.open && { transform: 'translateY(-200%)' }) || {}}
    >
      {!!navigationOnly ? (
        <>
          <SearchInputMobile />
          <MobileNavigation />
        </>
      ) : (
        <>
          <SearchInputMobile />
          {burgerSearching && burgerFiltering && (
            <>
              <CategoryFilter onChange={(open) => handleFilterStatusChange({ ...filterStatus, categoryOpen: open })} />
              <StatusFilter onChange={(open) => handleFilterStatusChange({ ...filterStatus, statusOpen: open })} />
              <TimeFrameFilter
                onChange={(open) => handleFilterStatusChange({ ...filterStatus, timeFrameOpen: open })}
              />
            </>
          )}
          {!burgerSearching && (
            <>
              <MobileNavigation />
              <CategoryList />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default React.memo(BurgerMenuContent)
