import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalType } from '../../entities/Proposal/types'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './CategoryLabel.css'

export type CategoryLabelProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  type: ProposalType
}

export default React.memo(function CategoryLabel({ type, ...props }: CategoryLabelProps) {
  return <div
    {...props}
    className={TokenList.join([
      `CategoryLabel`,
      `CategoryLabel--${type}`
    ])}
  >
    <span>{type}</span>
  </div>
})