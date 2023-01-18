import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, OldGrantCategory, ProposalType } from '../../entities/Proposal/types'
import CategoryOption from '../Category/CategoryOption'

import './CategoryFilter.css'
import CollapsibleFilter from './CollapsibleFilter'

type FilterType = typeof ProposalType | typeof NewGrantCategory | typeof OldGrantCategory

export type FilterProps = {
  onChange?: (open: boolean) => void
  startOpen?: boolean
}

function getValues<T extends object>(e: T): Array<T[keyof T]> {
  return Object.values(e)
}

function handleTypeFilter(type: string | null, params: URLSearchParams) {
  const newParams = new URLSearchParams(params)
  type ? newParams.set('type', type) : newParams.delete('type')
  newParams.delete('page')
  const stringParams = newParams.toString()
  return `${location.pathname}${stringParams === '' ? '' : '?' + stringParams}`
}

export default React.memo(function CategoryFilter({
  filterType,
  onChange,
  startOpen,
}: FilterProps & { filterType: FilterType }) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const filters = getValues(filterType)
  const type = params.get('type')
  const isProposalsFilter = isEqual(filterType, ProposalType)
  const isLegacyGrantsFilter = isEqual(filterType, OldGrantCategory)

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
          href={handleTypeFilter(null, params)}
          active={!type}
          className={'CategoryFilter__CategoryOption'}
        />
      )}
      {filters.map((value, index) => {
        const label = toSnakeCase(value)
        return (
          <CategoryOption
            key={'category_filter' + index}
            type={label}
            href={handleTypeFilter(label, params)}
            active={type === label}
            className={'CategoryFilter__CategoryOption'}
          />
        )
      })}
    </CollapsibleFilter>
  )
})
