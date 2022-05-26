import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalType } from '../../entities/Proposal/types'

import './CategoryLabel.css'

export type CategoryLabelProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  type: ProposalType
}

export default React.memo(function CategoryLabel({ type, ...props }: CategoryLabelProps) {
  const label = type.replaceAll('_', ' ')

  return (
    <div {...props} className={TokenList.join([`CategoryLabel`, `CategoryLabel--${type}`])}>
      <span>{label}</span>
    </div>
  )
})
