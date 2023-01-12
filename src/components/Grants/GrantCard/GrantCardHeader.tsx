import React from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { GrantWithUpdateAttributes } from '../../../entities/Proposal/types'
import Username from '../../User/Username'
import GrantPill from '../GrantPill'

import './GrantCardHeader.css'

export type GrantCardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantWithUpdateAttributes
}

const GrantCardHeader = ({ grant }: GrantCardHeaderProps) => {
  const { configuration, size } = grant
  const intl = useIntl()
  const t = useFormatMessage()

  return (
    <div className="GrantCardHeader">
      <div className="GrantCardHeader__ConfigurationInfo">
        <GrantPill type={configuration.category} />
        <div className="GrantCardHeader__SizeContainer GrantCardHeader__SizeContainerSlim">
          <p className="GrantCardHeader__Size">{`${t('component.grant_card.size')}: $${intl.formatNumber(
            size
          )} USD`}</p>
        </div>
      </div>
      <div className="GrantCardHeader__Username">
        {t('component.grant_card.by_user')}
        <Username address={grant.user} variant="address" />
      </div>
    </div>
  )
}

export default GrantCardHeader
