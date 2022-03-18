import React, {useMemo} from 'react'
import { useLocation } from '@reach/router'
import ActionableLayout from "../Layout/ActionableLayout"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import CategoryOption from './CategoryOption'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import locations from '../../modules/locations'

function CategoryList() {

  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const type = toProposalType(params.get('type')) ?? undefined

  const handleTypeFilter = (type: ProposalType | null) => {
    const newParams = new URLSearchParams(params)
    type ? newParams.set('type', type) : newParams.delete('type')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  return <ActionableLayout leftAction={<Header sub>{l(`page.proposal_list.categories`)}</Header>}>
      <CategoryOption type={'all'} href={handleTypeFilter(null)} active={type === null} />
      <CategoryOption type={ProposalType.Catalyst} href={handleTypeFilter(ProposalType.Catalyst)} active={type === ProposalType.Catalyst} />
      <CategoryOption type={ProposalType.POI} href={handleTypeFilter(ProposalType.POI)} active={type === ProposalType.POI} />
      <CategoryOption type={ProposalType.BanName} href={handleTypeFilter(ProposalType.BanName)} active={type === ProposalType.BanName} />
      <CategoryOption type={ProposalType.Grant} href={handleTypeFilter(ProposalType.Grant)} active={type === ProposalType.Grant} />
      <CategoryOption type={ProposalType.Poll} href={handleTypeFilter(ProposalType.Poll)} active={type === ProposalType.Poll} />
      <CategoryOption type={ProposalType.Draft} href={handleTypeFilter(ProposalType.Draft)} active={type === ProposalType.Draft} />
      <CategoryOption type={ProposalType.Governance} href={handleTypeFilter(ProposalType.Governance)} active={type === ProposalType.Governance} />
    </ActionableLayout>
}

export default CategoryList;
