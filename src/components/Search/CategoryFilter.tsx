import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import CategoryOption, { CategoryOptionProps } from '../Category/CategoryOption'
import GrantMultiCategory from '../Category/GrantMultiCategory'

import './CategoryFilter.css'
import CollapsibleFilter from './CollapsibleFilter'

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
  onChange?: (open: boolean) => void
  startOpen?: boolean
  categoryCount?: Counter
}

const FILTER_KEY = 'type'

export default function CategoryFilter({
  filterType,
  onChange,
  startOpen,
  categoryCount,
  showAllFilter = true,
}: FilterProps & { filterType: FilterType; showAllFilter?: boolean }) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const filters = Object.values(filterType)
  const type = params.get(FILTER_KEY)

  return (
    <CollapsibleFilter title={t('navigation.search.category_filter_title')} startOpen={!!startOpen} onChange={onChange}>
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

        const props: CategoryOptionProps = {
          type: label,
          href: getUrlFilters(FILTER_KEY, params, filter === ProjectTypeFilter.All ? undefined : label),
          active: type === label,
          className: 'CategoryFilter__CategoryOption',
          count: categoryCount?.[filter],
        }

        const key = 'category_filter' + index

        return (
          <>
            {isGrantType ? (
              <GrantMultiCategory
                key={key}
                {...props}
                subtypes={[
                  `${SubtypeAlternativeOptions.All}`,
                  ...Object.values(NewGrantCategory),
                  `${SubtypeAlternativeOptions.Legacy}`,
                ]}
              />
            ) : (
              <CategoryOption key={key} {...props} />
            )}
          </>
        )
      })}
    </CollapsibleFilter>
  )
}
