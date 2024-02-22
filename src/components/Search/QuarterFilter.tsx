import { useEffect, useMemo, useState } from 'react'

import { useLocation } from '@reach/router'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import { validateQuarter, validateYear } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Link from '../Common/Typography/Link'

import FilterContainer from './FilterContainer'
import './QuarterFilter.css'

const QUARTERS = [1, 2, 3, 4]

function getYears() {
  const currentYear = Time().year()
  const startYear = 2022
  const years = []

  for (let year = startYear; year <= currentYear; year++) {
    years.push(year)
  }

  return years
}

function QuarterFilter() {
  const t = useFormatMessage()
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const yearParam = params.get('year')
  const quarterParam = params.get('quarter')
  const validatedYear = validateYear(yearParam)
  const validatedQuarter = validateQuarter(quarterParam)

  useEffect(() => {
    if (validatedYear) {
      setSelectedYear(validatedYear)
    }
  }, [validatedYear])

  const getQuarterButtons = (year: number) => {
    return QUARTERS.map((quarter) => {
      const isActive = validatedYear === year && validatedQuarter === quarter
      if (isActive) {
        params.delete('year')
        params.delete('quarter')
      } else {
        params.set('year', String(year))
        params.set('quarter', String(quarter))
      }

      return (
        <Button
          className="QuarterFilter__Button"
          as={Link}
          href={`${location.pathname}?${params.toString()}`}
          key={quarter}
          active={isActive}
          fluid
        >
          Q{quarter}
        </Button>
      )
    })
  }

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
        {selectedYear && <div className="QuarterFilter__ButtonsContainer">{getQuarterButtons(selectedYear)}</div>}
      </div>
    </FilterContainer>
  )
}

export default QuarterFilter
