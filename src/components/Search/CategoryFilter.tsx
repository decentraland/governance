import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import CategoryOption from '../Category/CategoryOption'

import './CategoryFilter.css'
import FilterContainer from './FilterContainer'

export enum ProjectTypeFilter {
  All = 'all_projects',
  Grants = 'grants',
  BiddingAndTendering = 'bidding_and_tendering',
}

export type FilterType =
  | typeof ProposalType
  | typeof NewGrantCategory
  | typeof OldGrantCategory
  | typeof ProjectTypeFilter
export type Counter = Record<string, number | undefined>
export type FilterProps = {
  startOpen?: boolean
  categoryCount?: Counter
}

const FILTER_KEY = 'type'

export default function CategoryFilter({
  filterType,
  categoryCount,
  showAllFilter = true,
}: FilterProps & { filterType: FilterType; showAllFilter?: boolean }) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const filters = Object.values(filterType)
  const type = params.get(FILTER_KEY)

  return (
    <FilterContainer title={t('navigation.search.category_filter_title')}>
      {showAllFilter && (
        <CategoryOption
          type="all_proposals"
          href={getUrlFilters(FILTER_KEY, params)}
          active={!type}
          className="CategoryFilter__CategoryOption"
        />
      )}
      {filters.map((filter, index) => {
        const label = toSnakeCase(filter)
        const isGrantType = toProposalType(filter) === ProposalType.Grant || filter === ProjectTypeFilter.Grants

        return (
          <CategoryOption
            key={'category_filter' + index}
            type={label}
            href={getUrlFilters(FILTER_KEY, params, filter === ProjectTypeFilter.All ? undefined : label)}
            active={type === label}
            className="CategoryFilter__CategoryOption"
            count={categoryCount?.[filter]}
            subtypes={
              isGrantType
                ? [
                    `${SubtypeAlternativeOptions.All}`,
                    ...Object.values(NewGrantCategory),
                    `${SubtypeAlternativeOptions.Legacy}`,
                  ]
                : undefined
            }
          />
        )
      })}
    </FilterContainer>
  )
}
