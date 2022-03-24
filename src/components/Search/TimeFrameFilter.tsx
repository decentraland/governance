import React, { useMemo } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import locations from '../../modules/locations'
import { useLocation } from '@reach/router'
import FilterLabel from './FilterLabel'
import CollapsibleFilter from './CollapsibleFilter'
import { FilterProps } from './CategoryFilter'

export default React.memo(function TimeFrameFilter({onChange}:FilterProps) {
  const l = useFormatMessage()
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
    <CollapsibleFilter title={l('navigation.search.timeframe_filter.title') || ''} startOpen={false} onChange={onChange}>
      <FilterLabel label={l('navigation.search.timeframe_filter.all') || ''} href={handleTimeFrameFilter(null)} active={!timeFrame} />
      <FilterLabel label={l('navigation.search.timeframe_filter.week') || ''} href={handleTimeFrameFilter('week')} active={timeFrame === 'week'} />
      <FilterLabel label={l('navigation.search.timeframe_filter.month') || ''} href={handleTimeFrameFilter('month')} active={timeFrame === 'month'} />
      <FilterLabel label={l('navigation.search.timeframe_filter.3months') || ''} href={handleTimeFrameFilter('3months')} active={timeFrame === '3months'} />
    </CollapsibleFilter>)
})
