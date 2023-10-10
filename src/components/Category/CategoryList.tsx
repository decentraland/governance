import { useMemo } from 'react'

import { useLocation } from '@reach/router'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import { useBurgerMenu } from '../../hooks/useBurgerMenu'
import useFormatMessage from '../../hooks/useFormatMessage'
import ActionableLayout from '../Layout/ActionableLayout'

import CategoryOption from './CategoryOption'

const FILTER_KEY = 'type'

function CategoryList() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const type = toProposalType(params.get('type')) ?? undefined
  const { setStatus } = useBurgerMenu()

  function handleClick() {
    setStatus((prevState) => ({ ...prevState, open: false }))
  }

  return (
    <ActionableLayout leftAction={<Header sub>{t(`page.proposal_list.categories`)}</Header>}>
      <CategoryOption
        type={'all_proposals'}
        href={getUrlFilters(FILTER_KEY, params)}
        active={type === null}
        onClick={handleClick}
      />
      {(Object.keys(ProposalType) as Array<keyof typeof ProposalType>).map((key, index) => {
        return (
          <CategoryOption
            key={'category_list' + index}
            type={ProposalType[key]}
            href={getUrlFilters(FILTER_KEY, params, ProposalType[key])}
            active={type === ProposalType[key]}
            onClick={handleClick}
          />
        )
      })}
    </ActionableLayout>
  )
}

export default CategoryList
