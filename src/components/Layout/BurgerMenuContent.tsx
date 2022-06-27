import React, { useEffect, useState } from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { useBurgerMenu } from '../../hooks/useBurgerMenu'
import CategoryList from '../Category/CategoryList'
import CategoryFilter from '../Search/CategoryFilter'
import SearchInputMobile from '../Search/SearchInputMobile'
import StatusFilter from '../Search/StatusFilter'
import TimeFrameFilter from '../Search/TimeFrameFilter'

import './BurgerMenuContent.css'
import MobileNavigation from './MobileNavigation'
import { NavigationProps } from './Navigation'

export type FilterStatus = {
  categoryOpen: boolean
  statusOpen: boolean
  timeFrameOpen: boolean
}

export type BurgerMenuContentProps = NavigationProps & {
  navigationOnly?: boolean
  className?: string
}

const filtersInitialStatus = { categoryOpen: true, statusOpen: false, timeFrameOpen: false }

const OPEN_BURGER_HEIGHT = 697
const SEARCH_TITLE_HEIGHT = 32
const CATEGORY_FILTER_HEIGHT = 407
const STATUS_FILTER_HEIGHT = 290
const TIMEFRAME_FILTER_HEIGHT = 212
const CLOSED_FILTER_HEIGHT = 56
const MOBILE_NAVIGATION_HEIGHT = 184

function BurgerMenuContent({ navigationOnly, activeTab, className }: BurgerMenuContentProps) {
  const [footer, setFooter] = useState<Element | null>(null)
  const [filterStatus, setFilterStatus] = useState(filtersInitialStatus)
  const { status, setStatus } = useBurgerMenu()
  const { open, searching, filtering, translate } = status

  useEffect(() => {
    setFooter(document.querySelectorAll('.dcl.footer')[0])
    return () => {
      if (footer) {
        footer.setAttribute('style', '')
      }
    }
  }, [footer])

  useEffect(() => {
    if (footer) {
      footer.classList.add('Animated')
      if (translate) {
        footer.setAttribute('style', `transform: translateY(${translate})`)
      } else {
        footer.setAttribute('style', '')
      }
    }
  }, [footer, translate])

  function handleFilterStatusChange(status: FilterStatus) {
    setFilterStatus(status)
  }

  useEffect(() => {
    if (!open || !filtering || !searching) {
      setFilterStatus(filtersInitialStatus)
    }
  }, [open, filtering, searching])

  useEffect(() => {
    const filtersHeight =
      (filterStatus.categoryOpen ? CATEGORY_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT) +
      (filterStatus.statusOpen ? STATUS_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT) +
      (filterStatus.timeFrameOpen ? TIMEFRAME_FILTER_HEIGHT : CLOSED_FILTER_HEIGHT)

    let newTranslate: string | undefined
    if (navigationOnly) {
      newTranslate = MOBILE_NAVIGATION_HEIGHT + SEARCH_TITLE_HEIGHT + 'px'
    } else {
      if (!open) {
        newTranslate = undefined
      } else {
        newTranslate = (searching ? (filtering ? filtersHeight : SEARCH_TITLE_HEIGHT) : OPEN_BURGER_HEIGHT) + 'px'
      }
    }
    setStatus((prev) => ({ ...prev, translate: newTranslate }))
  }, [open, searching, filtering, filterStatus, navigationOnly, setStatus])

  return (
    <div
      className={TokenList.join(['BurgerMenuContent', 'Animated', className])}
      style={(!open && { transform: 'translateY(-200%)' }) || {}}
    >
      {navigationOnly ? (
        <>
          <SearchInputMobile />
          <MobileNavigation activeTab={activeTab} />
        </>
      ) : (
        <>
          <SearchInputMobile />
          {searching && filtering && (
            <>
              <CategoryFilter onChange={(open) => handleFilterStatusChange({ ...filterStatus, categoryOpen: open })} />
              <StatusFilter onChange={(open) => handleFilterStatusChange({ ...filterStatus, statusOpen: open })} />
              <TimeFrameFilter
                onChange={(open) => handleFilterStatusChange({ ...filterStatus, timeFrameOpen: open })}
              />
            </>
          )}
          {!searching && (
            <>
              <MobileNavigation activeTab={activeTab} />
              <CategoryList />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default React.memo(BurgerMenuContent)
