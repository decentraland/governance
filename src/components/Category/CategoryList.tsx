import React, { useMemo } from 'react'
import { useLocation } from '@reach/router'
import ActionableLayout from '../Layout/ActionableLayout'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import CategoryOption from './CategoryOption'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import locations from '../../modules/locations'
import { useBurgerMenu } from '../../hooks/useBurgerMenu'

function CategoryList() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const type = toProposalType(params.get('type')) ?? undefined
  const { setStatus } = useBurgerMenu()

  const handleTypeFilter = (type: ProposalType | null) => {
    const newParams = new URLSearchParams(params)
    type ? newParams.set('type', type) : newParams.delete('type')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  function handleClick() {
    setStatus((prevState) => ({ ...prevState, open: false }))
  }

  return (
    <ActionableLayout leftAction={<Header sub>{l(`page.proposal_list.categories`)}</Header>}>
      <CategoryOption type={'all'} href={handleTypeFilter(null)} active={type === null} onClick={handleClick} />
      {(Object.keys(ProposalType) as Array<keyof typeof ProposalType>).map((key, index) => {
        return (
          <CategoryOption
            key={'category_list' + index}
            type={ProposalType[key]}
            href={handleTypeFilter(ProposalType[key])}
            active={type === ProposalType[key]}
            onClick={handleClick}
          />
        )
      })}
    </ActionableLayout>
  )
}

export default CategoryList
