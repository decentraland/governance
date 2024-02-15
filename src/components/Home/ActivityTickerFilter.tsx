import React, { useState } from 'react'

import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query'
import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent } from '../../shared/types/events'
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
  setFilterState: React.Dispatch<React.SetStateAction<TickerFilter>>
  filterState: TickerFilter
  refetch: (
    options?: (RefetchOptions & RefetchQueryFilters) | undefined
  ) => Promise<QueryObserverResult<ActivityTickerEvent[]>>
}

export default function ActivityTickerFilter({ setFilterState, filterState, refetch }: Props) {
  const t = useFormatMessage()
  const [isOpen, setIsOpen] = useState(false)
  const selectedFiltersCount = countTrueProperties(filterState)

  const onApply = () => {
    refetch().then(() => setIsOpen(false))
  }

  const onClear = () => {
    setFilterState(() => INITIAL_TICKER_FILTER_STATE)
  }

  return (
    <>
      <div className={classNames('ActivityTickerFilter')} onClick={() => setIsOpen(true)}>
        <Counter count={selectedFiltersCount} size="small" hidden={isOpen || selectedFiltersCount === 0} />
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
        <div className="ActivityTickerFilterBox">
          <div className="ActivityTickerFilterItems">
            <ActivityTickerFilterItem
              onClick={() =>
                setFilterState((prevState) => ({ ...prevState, proposals_created: !prevState.proposals_created }))
              }
              checked={filterState.proposals_created}
              label={t('page.home.activity_ticker.filter.proposals_created')}
            />
            <ActivityTickerFilterItem
              onClick={() => setFilterState((prevState) => ({ ...prevState, votes: !prevState.votes }))}
              checked={filterState.votes}
              label={t('page.home.activity_ticker.filter.votes')}
            />
            <ActivityTickerFilterItem
              onClick={() => setFilterState((prevState) => ({ ...prevState, delegation: !prevState.delegation }))}
              checked={filterState.delegation}
              label={t('page.home.activity_ticker.filter.delegation')}
            />
            <ActivityTickerFilterItem
              onClick={() => setFilterState((prevState) => ({ ...prevState, comments: !prevState.comments }))}
              checked={filterState.comments}
              label={t('page.home.activity_ticker.filter.comments')}
            />
            <ActivityTickerFilterItem
              onClick={() =>
                setFilterState((prevState) => ({ ...prevState, project_updates: !prevState.project_updates }))
              }
              checked={filterState.project_updates}
              label={t('page.home.activity_ticker.filter.project_updates')}
            />
          </div>
          <div className={'ActivityTickerFilterBox__Buttons'}>
            <Button basic size={'small'} onClick={onClear}>
              {t('page.home.activity_ticker.filter.clear')}
            </Button>
            <Button primary size={'small'} onClick={onApply}>
              {t('page.home.activity_ticker.filter.apply')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
