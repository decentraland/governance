import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalGrantCategory } from '../../entities/Proposal/types'

import './GrantCategoryLabel.css'

export type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  category: ProposalGrantCategory
}

const GrantCategoryLabel = ({ category }: Props) => {
  const label = category.split(' ')[0]

  return (
    <div className={TokenList.join([`GrantCategoryLabel`, `GrantCategoryLabel--${label}`])}>
      <span>{label}</span>
    </div>
  )
}

export default GrantCategoryLabel
