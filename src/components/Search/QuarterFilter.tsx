import { useEffect, useMemo, useState } from 'react'

import { useLocation } from '@reach/router'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'

import FilterContainer from './FilterContainer'
import './QuarterFilter.css'

const QUARTERS = [1, 2, 3, 4]

function getYears() {
  const currentYear = Time().year()
  const startYear = 2021
  const years = []

  for (let year = startYear; year <= currentYear; year++) {
    years.push(year)
  }

  return years
}

function getQuarterDates(quarter: number, year: number) {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter should be between 1 and 4')
  }

  const startMonth = (quarter - 1) * 3 + 1

  const endMonth = startMonth + 2

  const startDate = Time(`${year}-${startMonth}-01`).startOf('month').format('YYYY-MM-DD')
  const endDate = Time(`${year}-${endMonth}-01`).endOf('month').add(1, 'day').format('YYYY-MM-DD')

  return { startDate, endDate }
}

function getQuarterButtons(year: number, from: string | null, to: string | null) {
  return QUARTERS.map((quarter) => {
    const { startDate, endDate } = getQuarterDates(quarter, year)
    const isActive = from === startDate && to === endDate

    return (
      <Button
        className="QuarterFilter__Button"
        as={Link}
        href={locations.projects({ from: startDate, to: endDate })}
        key={quarter}
        active={isActive}
        fluid
      >
        Q{quarter}
      </Button>
    )
  })
}

function QuarterFilter() {
  const t = useFormatMessage()
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const from = params.get('from')
  const to = params.get('to')
  useEffect(() => {
    if (from) {
      const year = Time(from).year()
      if (!isNaN(year)) setSelectedYear(year)
    }
  }, [from])

  return (
    <FilterContainer title={t('navigation.search.timeframe_filter.title')}>
      <div className="QuarterFilter">
        <Dropdown
          className="QuarterFilter__Dropdown"
          placeholder={t('navigation.search.timeframe_filter.year')}
          fluid
          selection
          options={getYears().map((year) => ({ text: year, value: year }))}
          onChange={(_, { value }) => setSelectedYear(value as number)}
          value={selectedYear}
        />
        {selectedYear && (
          <div className="QuarterFilter__ButtonsContainer">{getQuarterButtons(selectedYear, from, to)}</div>
        )}
      </div>
    </FilterContainer>
  )
}

export default QuarterFilter
