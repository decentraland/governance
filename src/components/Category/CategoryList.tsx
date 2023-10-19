import { useMemo } from 'react'

import { useLocation } from '@reach/router'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import ActionableLayout from '../Layout/ActionableLayout'

import CategoryOption from './CategoryOption'

const FILTER_KEY = 'type'

function CategoryList() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const type = toProposalType(params.get('type')) ?? undefined

  return (
    <ActionableLayout leftAction={<Header sub>{t(`page.proposal_list.categories`)}</Header>}>
      <CategoryOption type={'all_proposals'} href={getUrlFilters(FILTER_KEY, params)} active={type === null} />
      {(Object.keys(ProposalType) as Array<keyof typeof ProposalType>).map((key, index) => {
        return (
          <CategoryOption
            key={'category_list' + index}
            type={ProposalType[key]}
            href={getUrlFilters(FILTER_KEY, params, ProposalType[key])}
            active={type === ProposalType[key]}
          />
        )
      })}
    </ActionableLayout>
  )
}

export default CategoryList
