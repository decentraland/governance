import React from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GrantWithUpdateAttributes, ProposalGrantCategory } from '../../entities/Proposal/types'
import Pill from '../Common/Pill'
import Username from '../User/Username'

import { PROPOSAL_GRANT_CATEGORY_COLORS } from './GrantCard'
import './GrantCardHeader.css'

export type GrantCardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
  displayUser?: boolean
}

const GrantCardHeader = ({ grant, displayUser = false }: GrantCardHeaderProps) => {
  const { configuration, size } = grant
  const category: ProposalGrantCategory = configuration.category
  const intl = useIntl()
  const t = useFormatMessage()

  return (
    <div className="GrantCardHeader">
      {!displayUser && (
        <>
          <div className="GrantCardHeader__SizeContainer">
            <p className="GrantCardHeader__Size">{`${t('component.grant_card.size')}: `}</p>
            <p className="GrantCardHeader__SizeNumber">{`$${intl.formatNumber(size)} USD`}</p>
          </div>
          <Pill color={PROPOSAL_GRANT_CATEGORY_COLORS[category]}>{category.split(' ')[0]}</Pill>
        </>
      )}
      {displayUser && (
        <>
          <div className="GrantCardHeader__ConfigurationInfo">
            <Pill size="small" color={PROPOSAL_GRANT_CATEGORY_COLORS[category]}>
              {category.split(' ')[0]}
            </Pill>
            <div className="GrantCardHeader__SizeContainer GrantCardHeader__SizeContainerSlim">
              <p className="GrantCardHeader__Size">{`${t('component.grant_card.size')}: $${intl.formatNumber(
                size
              )} USD`}</p>
            </div>
          </div>
          <div className="GrantCardHeader__Username">
            {t('component.grant_card.by_user')}
            <Username address={grant.user} addressOnly={true} />
          </div>
        </>
      )}
    </div>
  )
}

export default GrantCardHeader
