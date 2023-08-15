import React from 'react'

import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import CategoryOption from '../Category/CategoryOption'

import './CategoryFilter.css'
import CollapsibleFilter from './CollapsibleFilter'

export enum ProjectCategoryFilter {
  Grants = 'grants',
  BiddingAndTendering = 'bidding_and_tendering',
}

export type FilterType =
  | typeof ProposalType
  | typeof NewGrantCategory
  | typeof OldGrantCategory
  | typeof ProjectCategoryFilter
export type Counter = Record<any, number>
export type FilterProps = {
  onChange?: (open: boolean) => void
  startOpen?: boolean
  categoryCount?: Counter
}

const FILTER_KEY = 'type'

function isCounterValid(counter: Counter, filterType: FilterType) {
  const counterKeys = Object.keys(counter)
  const filterKeys = Object.values(filterType)

  return isEqual(counterKeys, filterKeys)
}

export default function CategoryFilter({
  filterType,
  onChange,
  startOpen,
  categoryCount,
}: FilterProps & { filterType: FilterType }) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const filters = Object.values(filterType)
  const type = params.get(FILTER_KEY)
  const isProposalsFilter = isEqual(filterType, ProposalType)
  const isCounter = !!categoryCount && isCounterValid(categoryCount, filterType)

  return (
    <CollapsibleFilter title={t('navigation.search.category_filter_title')} startOpen={!!startOpen} onChange={onChange}>
      <CategoryOption
        type={isProposalsFilter ? 'all_proposals' : 'all_projects'}
        href={getUrlFilters(FILTER_KEY, params)}
        active={!type}
        className="CategoryFilter__CategoryOption"
      />
      {filters.map((filterType, index) => {
        const label = toSnakeCase(filterType)
        const isGrantType =
          toProposalType(filterType) === ProposalType.Grant || filterType === ProjectCategoryFilter.Grants

        return (
          <CategoryOption
            key={'category_filter' + index}
            type={label}
            href={getUrlFilters(FILTER_KEY, params, label)}
            active={type === label}
            className="CategoryFilter__CategoryOption"
            count={isCounter ? categoryCount[filterType as keyof Counter] : undefined}
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
    </CollapsibleFilter>
  )
}
