import { useMemo } from 'react'

import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import locations from '../../utils/locations'

import FilterContainer from './FilterContainer'
import FilterLabel from './FilterLabel'

export default function TimeFrameFilter() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const timeFrame = useMemo(() => params.get('timeFrame') || null, [params])

  function handleTimeFrameFilter(timeFrame: string | null) {
    const newParams = new URLSearchParams(params)
    timeFrame ? newParams.set('timeFrame', timeFrame) : newParams.delete('timeFrame')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  return (
    <FilterContainer title={t('navigation.search.timeframe_filter.title') || ''}>
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
    </FilterContainer>
  )
}
