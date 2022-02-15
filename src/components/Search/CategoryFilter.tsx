import React, { useMemo } from 'react'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import locations from '../../modules/locations'
import CategoryOption from '../Category/CategoryOption'
import { useLocation } from '@reach/router'
import CollapsibleFilter from './CollapsibleFilter'

import './CategoryFilter.css'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

export type FilterProps = {
  onChange?: (open: boolean) => void
}

export default React.memo(function CategoryFilter({onChange}:FilterProps) {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const type = toProposalType(params.get('type')) ?? undefined

  function handleTypeFilter(type: ProposalType | null) {
    const newParams = new URLSearchParams(params)
    type ? newParams.set('type', type) : newParams.delete('type')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  return (
    <CollapsibleFilter title={l('navigation.search.category_filter_title') || ''} startOpen={true} onChange={onChange}>
      <CategoryOption type={'all'}
                      href={handleTypeFilter(null)}
                      active={!type}
                      className={'CategoryFilter__CategoryOption'} />{
      (Object.keys(ProposalType) as Array<keyof typeof ProposalType>).map((key, index) => {
        return <CategoryOption
          key={'category_filter' + index}
          type={ProposalType[key]}
          href={handleTypeFilter(ProposalType[key])}
          active={type === ProposalType[key]}
          className={'CategoryFilter__CategoryOption'}
        />
      })
    }
    </CollapsibleFilter>
  )
})
