import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalType } from '../../entities/Proposal/types'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './CategoryLabel.css'

export type CategoryLabelProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  type: ProposalType
  secondaryType?: string
}

export default React.memo(function CategoryLabel({ type, secondaryType, ...props }: CategoryLabelProps) {
  return (
    <>
      <div
        {...props}
        className={TokenList.join([
          `CategoryLabel`,
          !!secondaryType && `CategoryLabel--withSecondary`,
          `CategoryLabel--${type}`,
        ])}
      >
        <span>{type}</span>
      </div>
      {secondaryType && (
        <div
          {...props}
          className={TokenList.join([
            `CategoryLabel`,
            `CategoryLabel--secondary`,
            `CategoryLabel--${type}-secondary`,
          ])}
        >
          <span>{secondaryType}</span>
        </div>
      )}
    </>
  )
})
