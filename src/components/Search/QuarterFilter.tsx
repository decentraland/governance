import { useEffect, useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

import { toGovernancePathname } from '../../helpers/browser'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import useYearAndQuarterParams from '../../hooks/useYearAndQuarterParams'
import Time from '../../utils/date/Time'
import { navigate } from '../../utils/locations'
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
  const { year: yearParam, quarter: quarterParam } = useYearAndQuarterParams()
  const params = useURLSearchParams()
  useEffect(() => {
    if (yearParam) {
      setSelectedYear(yearParam)
    }
  }, [yearParam])

  const getQuarterButtons = (year: number) => {
    return QUARTERS.map((quarter) => {
      const isActive = yearParam === year && quarterParam === quarter
      const isEnabled = year <= Time().year() && (year < Time().year() || quarter <= Time().quarter())
      if (isActive) {
        params.delete('quarter')
      } else {
        params.set('year', String(year))
        params.set('quarter', String(quarter))
      }

      return (
        <Button
          className="QuarterFilter__Button"
          as={Link}
          href={`${toGovernancePathname(location.pathname)}?${params.toString()}`}
          key={quarter}
          active={isActive}
          disabled={!isEnabled}
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
          placeholder={t('navigation.search.timeframe_filter.placeholder')}
          fluid
          selection
          clearable
          options={getYears().map((year) => ({ text: year, value: year }))}
          onChange={(_, { value }) => {
            if (!value) {
              setSelectedYear(undefined)
              params.delete('year')
              params.delete('quarter')
              navigate(`${toGovernancePathname(location.pathname)}?${params.toString()}`)
            } else {
              setSelectedYear(Number(value))
              params.set('year', String(value))
              params.delete('quarter')
              navigate(`${toGovernancePathname(location.pathname)}?${params.toString()}`)
            }
          }}
          value={selectedYear}
        />
        {selectedYear && <div className="QuarterFilter__ButtonsContainer">{getQuarterButtons(selectedYear)}</div>}
      </div>
    </FilterContainer>
  )
}

export default QuarterFilter
