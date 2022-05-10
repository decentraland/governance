import { useLocation } from '@reach/router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React, { useMemo } from 'react'

import locations from '../../modules/locations'
import { FilterProps } from './CategoryFilter'
import CollapsibleFilter from './CollapsibleFilter'
import FilterLabel from './FilterLabel'

export default React.memo(function TimeFrameFilter({ onChange }: FilterProps) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const timeFrame = useMemo(() => params.get('timeFrame') || null, [params])

  function handleTimeFrameFilter(timeFrame: string | null) {
    const newParams = new URLSearchParams(params)
    timeFrame ? newParams.set('timeFrame', timeFrame) : newParams.delete('timeFrame')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  return (
    <CollapsibleFilter
      title={t('navigation.search.timeframe_filter.title') || ''}
      startOpen={false}
      onChange={onChange}
    >
      <FilterLabel
        label={t('navigation.search.timeframe_filter.all') || ''}
        href={handleTimeFrameFilter(null)}
        active={!timeFrame}
      />
      <FilterLabel
        label={t('navigation.search.timeframe_filter.week') || ''}
        href={handleTimeFrameFilter('week')}
        active={timeFrame === 'week'}
      />
      <FilterLabel
        label={t('navigation.search.timeframe_filter.month') || ''}
        href={handleTimeFrameFilter('month')}
        active={timeFrame === 'month'}
      />
      <FilterLabel
        label={t('navigation.search.timeframe_filter.3months') || ''}
        href={handleTimeFrameFilter('3months')}
        active={timeFrame === '3months'}
      />
    </CollapsibleFilter>
  )
})
