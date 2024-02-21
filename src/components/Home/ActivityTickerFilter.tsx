import React, { useEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useFormatMessage from '../../hooks/useFormatMessage'
import Counter from '../Common/Counter'
import Sort from '../Icon/Sort'

import './ActivityTickerFilter.css'
import ActivityTickerFilterItem from './ActivityTickerFilterItem'

export type TickerFilter = {
  proposals_created: boolean
  votes: boolean
  delegation: boolean
  comments: boolean
  project_updates: boolean
}

export const INITIAL_TICKER_FILTER_STATE: TickerFilter = {
  proposals_created: false,
  votes: false,
  delegation: false,
  comments: false,
  project_updates: false,
}

function countTrueProperties(obj: Record<string, boolean>): number {
  let count = 0
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      if (obj[key]) {
        count++
      }
    }
  }
  return count
}

interface Props {
  onApply: (filters: TickerFilter) => void
  filterState: TickerFilter
}

export default function ActivityTickerFilter({ onApply, filterState }: Props) {
  const t = useFormatMessage()
  const [isOpen, setIsOpen] = useState(false)
  const [checkedFilters, setCheckedFilters] = useState<TickerFilter>(filterState)
  const selectedFiltersCount = countTrueProperties(filterState)
  const filterRef = useRef<HTMLDivElement>(null)

  const handleApply = () => {
    onApply(checkedFilters)
    setIsOpen(false)
  }

  const handleClear = () => {
    setCheckedFilters(INITIAL_TICKER_FILTER_STATE)
  }

  useEffect(() => {
    setCheckedFilters(filterState)
  }, [filterState, isOpen])

  const onEventTypeClick = (filterClicked: keyof TickerFilter) => {
    setCheckedFilters((prev) => ({ ...prev, [filterClicked]: !prev[filterClicked] }))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterRef])

  return (
    <>
      <div className={classNames('ActivityTickerFilter')} onClick={() => setIsOpen(true)}>
        {!(isOpen || selectedFiltersCount === 0) && <Counter count={selectedFiltersCount} size="small" />}
        <div
          className={classNames(
            'ActivityTickerFilter__LabeledArrow',
            isOpen && `ActivityTickerFilter__LabeledArrow--open`
          )}
        >
          <span className="ActivityTickerFilter__Label">{t('page.home.activity_ticker.filter.label')}</span>
          <Sort descending selectedColor="primary" />
        </div>
      </div>
      {isOpen && (
        <div className="ActivityTickerFilterBox" ref={filterRef}>
          <div className="ActivityTickerFilterItems">
            <ActivityTickerFilterItem
              onClick={() => onEventTypeClick('proposals_created')}
              checked={checkedFilters.proposals_created}
              label={t('page.home.activity_ticker.filter.proposals_created')}
            />
            <ActivityTickerFilterItem
              onClick={() => onEventTypeClick('votes')}
              checked={checkedFilters.votes}
              label={t('page.home.activity_ticker.filter.votes')}
            />
            <ActivityTickerFilterItem
              onClick={() => onEventTypeClick('delegation')}
              checked={checkedFilters.delegation}
              label={t('page.home.activity_ticker.filter.delegation')}
            />
            <ActivityTickerFilterItem
              onClick={() => onEventTypeClick('comments')}
              checked={checkedFilters.comments}
              label={t('page.home.activity_ticker.filter.comments')}
            />
            <ActivityTickerFilterItem
              onClick={() => onEventTypeClick('project_updates')}
              checked={checkedFilters.project_updates}
              label={t('page.home.activity_ticker.filter.project_updates')}
            />
          </div>
          <div className={'ActivityTickerFilterBox__Buttons'}>
            <Button basic size={'small'} onClick={handleClear}>
              {t('page.home.activity_ticker.filter.clear')}
            </Button>
            <Button primary size={'small'} onClick={handleApply}>
              {t('page.home.activity_ticker.filter.apply')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
