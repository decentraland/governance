import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GrantType, ProposalType } from '../../entities/Proposal/types'
import CategoryOption from '../Category/CategoryOption'

import './CategoryFilter.css'
import CollapsibleFilter from './CollapsibleFilter'

export type FilterProps = {
  onChange?: (open: boolean) => void
}

function getValues<T extends object>(e: T): Array<T[keyof T]> {
  return (Object.keys(e) as (keyof T)[]).map((k) => e[k])
}

function handleTypeFilter(type: ProposalType | GrantType | null, params: URLSearchParams) {
  const newParams = new URLSearchParams(params)
  type ? newParams.set('type', type) : newParams.delete('type')
  newParams.delete('page')
  const stringParams = newParams.toString()
  return `${location.pathname}${stringParams === '' ? '' : '?' + stringParams}`
}

export default React.memo(function CategoryFilter({
  filterType,
  onChange,
}: FilterProps & { filterType: typeof ProposalType | typeof GrantType }) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const filters = getValues(filterType)
  const type = filters.find((filter) => filter === params.get('type'))

  return (
    <CollapsibleFilter title={t('navigation.search.category_filter_title') || ''} startOpen={true} onChange={onChange}>
      <CategoryOption
        type={'all'}
        href={handleTypeFilter(null, params)}
        active={!type}
        className={'CategoryFilter__CategoryOption'}
      />
      {filters.map((value, index) => {
        return (
          <CategoryOption
            key={'category_filter' + index}
            type={value}
            href={handleTypeFilter(value, params)}
            active={type === value}
            className={'CategoryFilter__CategoryOption'}
          />
        )
      })}
    </CollapsibleFilter>
  )
})
