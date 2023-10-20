import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { BiddingProcessType, ImplementationProcessType, ProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import CategoryOption, { CategoryOptionProps } from '../Category/CategoryOption'
import GrantMultiCategory from '../Category/GrantMultiCategory'
import GroupedCategoryOption from '../Category/GroupedCategoryOption'

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
const GOVERNANCE_GROUP: ImplementationProcessType[] = [ProposalType.Poll, ProposalType.Draft, ProposalType.Governance]
const BIDDING_GROUP: BiddingProcessType[] = [ProposalType.Pitch, ProposalType.Tender, ProposalType.Bid]

function getUncategorizedProposalTypes(types: typeof ProposalType) {
  return Object.values(types).filter((type) => {
    return ![ProposalType.Grant, ...BIDDING_GROUP, ...GOVERNANCE_GROUP].includes(type as never)
  })
}

export default function CategoryFilter({
  filterType,
  categoryCount,
  showAllFilter = true,
}: FilterProps & { filterType: FilterType; showAllFilter?: boolean }) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const type = params.get(FILTER_KEY)

  const areProposals = isEqual(filterType, ProposalType)
  const filters = areProposals ? getUncategorizedProposalTypes(filterType as never) : Object.values(filterType)

  const getCategoryOptionProps = (filter: string): CategoryOptionProps => {
    const label = toSnakeCase(filter)

    return {
      type: label,
      href: getUrlFilters(FILTER_KEY, params, filter === ProjectTypeFilter.All ? undefined : label),
      active: type === label,
      className: 'CategoryFilter__CategoryOption',
      count: categoryCount?.[filter],
    }
  }

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
        return <CategoryOption key={'category_filter' + index} {...getCategoryOptionProps(filter)} />
      })}
      {areProposals && (
        <>
          <GrantMultiCategory
            {...getCategoryOptionProps(ProposalType.Grant)}
            subtypes={[
              `${SubtypeAlternativeOptions.All}`,
              ...Object.values(NewGrantCategory),
              `${SubtypeAlternativeOptions.Legacy}`,
            ]}
          />
          <GroupedCategoryOption
            className="CategoryFilter__CategoryOption"
            type="implementation"
            group={GOVERNANCE_GROUP}
            active={GOVERNANCE_GROUP.includes(type as never)}
          />
          <GroupedCategoryOption
            className="CategoryFilter__CategoryOption"
            type="bidding_and_tendering"
            group={BIDDING_GROUP}
            active={BIDDING_GROUP.includes(type as never)}
          />
        </>
      )}
    </FilterContainer>
  )
}
