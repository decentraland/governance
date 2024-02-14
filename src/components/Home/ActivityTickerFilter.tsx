import React, { useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useFormatMessage from '../../hooks/useFormatMessage'
import Sort from '../Icon/Sort'

import './ActivityTickerFilter.css'
import ActivityTickerFilterItem from './ActivityTickerFilterItem'

type TickerFilter = {
  proposals_created: boolean
  proposals_ended: boolean
  votes: boolean
  delegation: boolean
  comments: boolean
  projects: boolean
}

const INITIAL_TICKER_FILTER_STATE = {
  proposals_created: false,
  proposals_ended: false,
  votes: false,
  delegation: false,
  comments: false,
  projects: false,
}

export default function ActivityTickerFilter() {
  const t = useFormatMessage()
  const [isOpen, setIsOpen] = useState(false)
  const [filterState, setFilterState] = useState<TickerFilter>(INITIAL_TICKER_FILTER_STATE)

  const onClick = () => {
    setIsOpen(true)
  }

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div className={classNames('ActivityTickerFilter', isOpen && `ActivityTickerFilter--open`)} onClick={onClick}>
        <span className="ActivityTickerFilter__Label">{'Filter'}</span>
        <Sort descending selectedColor="primary" />
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
              onClick={() =>
                setFilterState((prevState) => ({ ...prevState, proposals_ended: !prevState.proposals_ended }))
              }
              checked={filterState.proposals_ended}
              label={t('page.home.activity_ticker.filter.proposals_ended')}
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
              onClick={() => setFilterState((prevState) => ({ ...prevState, projects: !prevState.projects }))}
              checked={filterState.projects}
              label={t('page.home.activity_ticker.filter.projects')}
            />
          </div>
          <div className={'ActivityTickerFilterBox__Buttons'}>
            <Button basic size={'small'} onClick={onClose}>
              {'Clear'}
            </Button>
            <Button primary size={'small'} onClick={onClose}>
              {'Apply'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
