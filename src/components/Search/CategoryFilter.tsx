import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, SubtypeAlternativeOptions } from '../../entities/Grant/types'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import CategoryOption from '../Category/CategoryOption'

import './CategoryFilter.css'
import CollapsibleFilter from './CollapsibleFilter'

export type FilterType = typeof ProposalType | typeof NewGrantCategory | typeof OldGrantCategory
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

export default React.memo(function CategoryFilter({
  filterType,
  onChange,
  startOpen,
  categoryCount,
}: FilterProps & { filterType: FilterType }) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const filters: string[] = Object.values(filterType)
  const type = params.get(FILTER_KEY)
  const isProposalsFilter = isEqual(filterType, ProposalType)
  const isLegacyGrantsFilter = isEqual(filterType, OldGrantCategory)
  const isCounter = !!categoryCount && isCounterValid(categoryCount, filterType)

  return (
    <CollapsibleFilter
      title={t(
        isLegacyGrantsFilter ? 'navigation.search.legacy_filter_title' : 'navigation.search.category_filter_title'
      )}
      startOpen={!!startOpen}
      onChange={onChange}
    >
      {!isLegacyGrantsFilter && (
        <CategoryOption
          type={isProposalsFilter ? 'all_proposals' : 'all_grants'}
          href={getUrlFilters(FILTER_KEY, params)}
          active={!type}
          className={'CategoryFilter__CategoryOption'}
        />
      )}
      {filters.map((filterType, index) => {
        const label = toSnakeCase(filterType)
        const isGrantType = toProposalType(filterType) === ProposalType.Grant
        return (
          <CategoryOption
            key={'category_filter' + index}
            type={label}
            href={getUrlFilters(FILTER_KEY, params, label)}
            active={type === label}
            className={'CategoryFilter__CategoryOption'}
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
})
